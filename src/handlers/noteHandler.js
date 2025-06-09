import User from "../models/userSchema.js";
import Run from "../models/runSchema.js";
import Note from "../models/noteSchema.js";

import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import createHttpError from "http-errors";

//CREATE
const createNewNote = async (content, userId, runId) => {
  //FUNCTION: Create a new note ascribed to a given userId and runId.
  //Update total note properties for user and run in a mongoose session/transaction.
  //We also authenticate that the given run belongs to this user in this session.
  //If any document updates fail, abort all updates

  //Sanitize content
  content = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
  content = content.trim().charAt(0).toUpperCase() + content.slice(1);

  //Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //Find the run and update the number of notes in the run
    const run = await Run.findOneAndUpdate(
      { _id: runId },
      { $inc: { tot_notes: 1, tot_open_notes: 1 } }
    ).session(session);

    //If the run does not exist, throw an error.
    if (!run) {
      throw new createHttpError(
        404,
        "Cannot add a note to a run that does not exist. Try creating a new run and trying again!"
      );
    }

    //If the userId for the run does not match the userId passed to this function from req.user,
    // throw an error. Users may not add notes to runs that are not theirs.
    if (run.userId.toString() !== userId) {
      throw new createHttpError(403, "You do not have permission for this.");
    }

    //Create the note. Using .save instead of .create for support of sessions.
    const newNoteDoc = new Note({ content, userId, runId });
    await newNoteDoc.save({ session });

    //Update the user total notes.
    //Any time a user adds a new note to a run, we want to indicate that is the user's current run.
    //We also want to manually store the time the last note was added to a run, so that downstream we can determine if this run is still current.
    await User.updateOne(
      { _id: userId },
      {
        $inc: { tot_notes: 1, tot_open_notes: 1 },
        $set: { current_run: runId, currentRunUpdatedAt: run.updatedAt },
      }
    ).session(session);

    //If all has gone well, commit the transaction and end the function.
    await session.commitTransaction();
    session.endSession();
    return;
  } catch (error) {
    //If there is an error, abort the transaction.
    await session.abortTransaction();
    session.endSession();
    throw error; // Then we can throw the errors out to the controller.
  }
};

//READ
const getNote = async (noteId) => {
  //FUNCTION: return one note
  const note = await Note.findOne({ _id: noteId }).lean();
  return note;
};

//UPDATE

const toggleOpen = async (noteId, loggedUserId) => {
  //FUNCTION: toggle open status of a given note, plus tot_open_notes properties of associated run+user

  //Start mongoose transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const note = await getNote(noteId);
    const userId = note.userId.toString();

    //If the userId of the note does not match loggedUserId (from req.user), throw 403 error.
    if (userId !== loggedUserId) {
      throw new createHttpError(
        403,
        "You do not have permission to access this"
      );
    }

    //set the open status to the opposite of what it is now. !true = false, !false = true
    const updatedNote = await Note.updateOne(
      { _id: noteId },
      { $set: { open: !note.open } }
    ).session(session);

    //Determine if we are opening or closing a note. if note.open == false, -1 from tot_open notes. if note.open == true, +1 to tot_open_notes
    const inc = note.open ? -1 : 1;
    await User.updateOne(
      { _id: userId },
      { $inc: { tot_open_notes: inc } }
    ).session(session);
    await Run.updateOne(
      { _id: note.runId },
      { $inc: { tot_open_notes: inc } }
    ).session(session);

    //If all goes well, commit the transcation and end the function.
    await session.commitTransaction();
    session.endSession();
    return;
  } catch (error) {
    //if failure has come upon us, don't save any of this.
    await session.abortTransaction();
    session.endSession();
    throw error; // Throw the error out to controller.
  }
};

const updateNote = async (noteId, content, loggedUserId) => {
  //FUNCTION: update the content of a given note, return the note object
  const note = await getNote(noteId);
  const userId = note.userId.toString();

  //Throw 403 error if req.user id does not math the userId stored in the note.
  //We check this before committing any changes to the note.
  if (loggedUserId !== userId) {
    throw new createHttpError(403, "You do not have permission to access this");
  }

  //Sanitize content
  content = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
  content = content.trim().charAt(0).toUpperCase() + content.slice(1);

  const updatedNote = await Note.findOneAndUpdate(
    { _id: noteId },
    { content },
    { new: true }
  );

  return updatedNote;
};

//DELETE

const deleteNote = async (noteId, loggedUserId) => {
  //FUNCTION: delete a given note, then reduce the total notes, open notes in its umbrella run and user.

  //Start mongoose transaction since we are altering multiple documents.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //Get the note properties so that we can update its associated user and run later
    const { userId, runId, open } = await getNote(noteId);

    //Check user authorization. loggedUserId (from req.user) should match the userId of the note.
    if (loggedUserId !== userId.toString()) {
      throw new createHttpError(
        403,
        "You do not have permission to access this"
      );
    }

    //Delete the note
    await Note.deleteOne({ _id: noteId }).session(session);

    //Update tracker fields in user and run.
    const inc = open ? -1 : 1;
    await User.updateOne(
      { _id: userId },
      { $inc: { tot_notes: -1, tot_open_notes: inc } }
    ).session(session);
    await Run.updateOne(
      { _id: runId },
      { $inc: { tot_notes: -1, tot_open_notes: inc } }
    ).session(session);

    //If all goes well, commit the transcation and end the function.
    await session.commitTransaction();
    session.endSession();
    return;
  } catch (error) {
    //failure beckons, we must answer its call and abort all of our changes
    await session.abortTransaction();
    session.endSession();
    throw error; // Throw the error out to controller.
  }
};

export default {
  createNewNote,
  getNote,
  updateNote,
  toggleOpen,
  deleteNote,
};
