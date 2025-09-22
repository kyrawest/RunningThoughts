import User from "../models/userSchema.js";
import Run from "../models/runSchema.js";
import Note from "../models/noteSchema.js";
import noteHandler from "./noteHandler.js";

import sanitizeHtml from "sanitize-html";
import mongoose from "mongoose";
import createHttpError from "http-errors";

//CREATE

const createNewRunWithNote = async ({ userId, title = "" }, content) => {
  //Create a new run with a note, update associated user.

  //Sanitize user inputted title if it exists.
  if (title !== "") {
    title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
    title = title.trim().charAt(0).toUpperCase() + title.slice(1);
  }

  //Sanitize content
  content = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
  content = content.trim().charAt(0).toUpperCase() + content.slice(1);

  //Start mongoose transaction since we are altering multiple documents.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //We create documents then save instead of using .create to enable support of the session.
    //Create new run with 1 note
    const newRunDoc = new Run({
      userId,
      title,
      tot_notes: 1,
      tot_open_notes: 1,
    });
    const newRun = await newRunDoc.save({ session });
    const runId = newRun._id;

    //Create new note tied to the run we just made
    const newNoteDoc = new Note({ content, userId, runId });
    await newNoteDoc.save({ session });

    //Update associated user
    await User.updateOne({
      $inc: { tot_runs: 1, tot_notes: 1, tot_open_notes: 1 },
      $set: { current_run: runId, currentRunUpdatedAt: newRun.updatedAt },
    }).session(session);

    //If all goes well, commit the transcation and end the function.
    await session.commitTransaction();
    session.endSession();
    return newRun;
  } catch (error) {
    //if we tripped up during the transaction, don't commit any of these changes.
    await session.abortTransaction();
    session.endSession();
    throw error; // Throw the error out to controller.
  }
};

const createNewRun = async ({ userId, title = "" }) => {
  //Create a new run.
  // Also update the associated User: +1 to tot_runs, set current_run to this runId, and set currentRunUpdatedAt to now.

  //Sanitize user inputted title if it exists.
  if (title !== "") {
    title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
    title = title.trim().charAt(0).toUpperCase() + title.slice(1);
  }

  //Start mongoose transaction since we are altering multiple documents.
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //Create our new run
    const newRunDoc = new Run({
      userId,
      title,
      tot_notes: 1,
      tot_open_notes: 1,
    });
    const newRun = await newRunDoc.save({ session });

    //Update our user
    await User.updateOne(
      { _id: userId },
      {
        $inc: { tot_runs: 1 },
        $set: {
          current_run: newRun._id,
          currentRunUpdatedAt: newRun.updatedAt,
        },
      }
    ).session(session);

    //If all goes well, commit the transcation and end the function.
    await session.commitTransaction();
    session.endSession();
    return newRun;
  } catch (error) {
    //even one failure can ruin us - we must turn back if so
    await session.abortTransaction();
    session.endSession();
    throw error; // Throw the error out to controller.
  }
};

const addNoteToCurrentRun = async (content, userId) => {
  //FUNCTION: add a note to the current run for a given user if it exists, and is less than 2 hours old.
  //If it does not exist, create a new run and add the note to it.

  const user = await User.findById(userId).lean();
  const current_run = user.current_run;
  const currentRunUpdatedAt = user.currentRunUpdatedAt;

  //if the current run does not exist or the currenRunUpdatedAt is over 2 hours ago, create a new run and add the note to it.
  if (
    !current_run ||
    new Date(currentRunUpdatedAt) < new Date(Date.now() - 2 * 60 * 60 * 1000)
  ) {
    await createNewRunWithNote({ userId }, content);
  } else {
    await noteHandler.createNewNote(content, userId.toString(), current_run);
  }
};

//READ

const getRunNotes = async (runId) => {
  //FUNCTION: returns an array of all the notes associated with a given run
  // Notes created last are presented first
  return await Note.find({ runId }).sort({ createdAt: -1 }).lean();
};

const getRun = async (runId) => {
  //FUNCTION: return one run
  return await Run.findOne({ _id: runId }).lean();
};

//UPDATE

const updateRun = async (runId, title, loggedUserId) => {
  //FUNCTION: update a given run's title

  //Check if the loggedUserId (req.user) is the same as the userId associated with the run. If not, throw error.
  const run = await getRun(runId);
  const userId = run.userId.toString();

  if (loggedUserId !== userId) {
    throw new createHttpError(403, "You do not have permission for this.", {
      expose: true,
    });
  }

  //Sanitize user inputted title
  title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
  title = title.trim().charAt(0).toUpperCase() + title.slice(1);

  await Run.updateOne({ _id: runId }, { $set: { title } }).lean();
};

//DELETE

const deleteRunNotes = async (runId, loggedUserId) => {
  //FUNCTION: delete all notes associated with a run, then update the total notes, open notes for that run and associated user

  const run = await getRun(runId);
  const userId = run.userId.toString();

  if (loggedUserId !== userId) {
    throw new Error("You do not have permission to access this");
  }

  const runNotesInt = run.tot_notes;
  const open = run.tot_open_notes;

  //Start mongoose transaction since we are altering multiple documents.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Note.deleteMany({ runId }).session(session);

    await Run.updateOne(
      { _id: runId },
      { $set: { tot_notes: 0, tot_open_notes: 0 } }
    ).session(session);
    await User.updateOne(
      { _id: userId },
      { $inc: { tot_notes: -runNotesInt, tot_open_notes: -open } }
    ).session(session);

    // If all goes well, commit the transcation and end the function.
    await session.commitTransaction();
    session.endSession();
    return;
  } catch (error) {
    // you know the drill, abort all if any fails
    await session.abortTransaction();
    session.endSession();
    throw error; // Throw the error out to controller.
  }
};

const deleteRun = async (runId, loggedUserId) => {
  //FUNCTION: delete a Run associated with this id, and delete associated notes.
  // Also update the associated user - reduce tot_notes and tot_open_notes appropriately, reset current_run fields if this run was current.

  //Check if user is authorized to alter this run.
  const run = await getRun(runId);
  const userId = run.userId.toString();

  if (loggedUserId !== userId) {
    throw new createHttpError(
      403,
      "You do not have permission to access this",
      { expose: true }
    );
  }

  //Start mongoose transaction since we are altering multiple documents.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //get the current run for this user so we can check if we need to reset it later
    const user = await User.findById(loggedUserId).select("current_run").lean();
    const current_run = user?.current_run;

    // Delete notes
    await Note.deleteMany({ runId }).session(session);

    //Delete run
    await Run.deleteOne({ _id: runId }).session(session);

    //Update the user
    const runNotesInt = run.tot_notes;
    const open = run.tot_open_notes;

    if (current_run == runId) {
      //if this is the current run, set this property to null for the user.
      await User.updateOne(
        { _id: userId },
        {
          $inc: {
            tot_runs: -1,
            tot_notes: -runNotesInt,
            tot_open_notes: -open,
          },
          $set: { current_run: null, currentRunUpdatedAt: null },
        }
      ).session(session);
    } else {
      await User.updateOne(
        { _id: userId },
        {
          $inc: {
            tot_runs: -1,
            tot_notes: -runNotesInt,
            tot_open_notes: -open,
          },
        }
      ).session(session);
    }
    // If all goes well, commit the transcation and end the function.
    await session.commitTransaction();
    session.endSession();
    return;
  } catch (error) {
    // you know the drill, abort all if any fails
    await session.abortTransaction();
    session.endSession();
    throw error; // Throw the error out to controller.
  }
};

export default {
  createNewRunWithNote,
  createNewRun,
  addNoteToCurrentRun,
  getRunNotes,
  getRun,
  updateRun,
  deleteRunNotes,
  deleteRun,
};
