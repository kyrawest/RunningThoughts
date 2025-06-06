import User from "../models/userSchema.js";
import Run from "../models/runSchema.js";
import Note from "../models/noteSchema.js";

import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import createHttpError from "http-errors";

//CREATE
const createNewNote = async (content, userId, runId) => {
  content = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
  content = content.trim().charAt(0).toUpperCase() + content.slice(1);

  const newNote = await Note.create({ content, userId, runId });
  const run = await Run.findOneAndUpdate(
    { _id: runId },
    { $inc: { tot_notes: 1, tot_open_notes: 1 } }
  );
  console.log(run);
  if (!run) {
    throw new createHttpError(
      404,
      "Cannot add a note to a run that does not exist. Try creating a new run and trying again!"
    );
  }

  await User.updateOne(
    { _id: userId },
    {
      $inc: { tot_notes: 1, tot_open_notes: 1 },
      $set: { current_run: runId, currentRunUpdatedAt: run.updatedAt },
    }
  );

  return newNote;
};

//READ
const getNote = async (noteId) => {
  //FUNCTION: return one note
  const note = await Note.findOne({ _id: noteId }).lean();
  return note;
};

//UPDATE

const updateNote = async (noteId, content, loggedUserId) => {
  //FUNCTION: update the content of a given note, return the note object
  const note = await getNote(noteId);
  const userId = note.userId.toString();

  if (loggedUserId !== userId) {
    throw new Error("You do not have permission to access this");
  }

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

const toggleOpen = async (noteId, loggedUserId) => {
  //FUNCTION: toggle open status of a given note
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const note = await getNote(noteId);
    const userId = note.userId.toString();

    if (userId !== loggedUserId) {
      throw new Error("You do not have permission to access this");
    }

    //set the open status to the opposite of what it is now. !true = false, !false = true
    const updatedNote = await Note.updateOne(
      { _id: noteId },
      { $set: { open: !note.open } }
    );

    const inc = note.open ? -1 : 1;
    await User.updateOne({ _id: userId }, { $inc: { tot_open_notes: inc } });
    await Run.updateOne({ _id: note.runId }, { $inc: { tot_open_notes: inc } });

    await session.commitTransaction();
    session.endSession();

    return;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error; // Handle the error
  }
};

//DELETE

const deleteNote = async (noteId, loggedUserId) => {
  //FUNCTION: delete a given note, then reduce the total notes in its umbrella run and user.
  const { userId, runId, open } = await getNote(noteId);

  if (loggedUserId !== userId.toString()) {
    throw new Error("You do not have permission to access this");
  }

  await Note.deleteOne({ _id: noteId });

  await User.updateOne(
    { _id: userId },
    { $inc: { tot_notes: -1, tot_open_notes: open ? -1 : 0 } }
  );
  await Run.updateOne(
    { _id: runId },
    { $inc: { tot_notes: -1, tot_open_notes: open ? -1 : 0 } }
  );
};

export default {
  createNewNote,
  getNote,
  updateNote,
  toggleOpen,
  deleteNote,
};
