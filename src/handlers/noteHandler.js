import User from "../models/userSchema.js";
import Run from "../models/runSchema.js";
import Note from "../models/noteSchema.js";

//CREATE
const createNewNote = async (content, userId, runId) => {
  const newNote = await Note.create({ content, userId, runId });
  await User.updateOne({ _id: userId }, { $inc: { tot_notes: 1 } });
  await Run.updateOne({ _id: runId }, { $inc: { tot_notes: 1 } });
  return newNote;
};

//READ
const getNote = async (noteId) => {
  //FUNCTION: return one note
  return await Note.findOne({ _id: noteId }).lean();
};

//UPDATE

const updateNote = async (noteId, content, loggedUserId) => {
  //FUNCTION: update the content of a given note, return the note object

  const note = await getNote(noteId);
  const userId = note.userId.toString();

  if (loggedUserId !== userId) {
    throw new Error("You do not have permission to access this");
  }

  const updatedNote = await Note.updateOne({ _id: noteId }, { content });
  return updatedNote;
};

//DELETE

const deleteNote = async (noteId, loggedUserId) => {
  //FUNCTION: delete a given note, then reduce the total notes in its umbrella run and user.
  const { userId, runId } = await getNote(noteId);

  if (loggedUserId !== userId.toString()) {
    throw new Error("You do not have permission to access this");
  }

  await Note.deleteOne({ _id: noteId });

  await User.updateOne({ _id: userId }, { $inc: { tot_notes: -1 } });
  await Run.updateOne({ _id: runId }, { $inc: { tot_notes: -1 } });
};

export default {
  createNewNote,
  getNote,
  updateNote,
  deleteNote,
};
