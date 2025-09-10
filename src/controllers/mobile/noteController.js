import noteHandler from "../handlers/noteHandler.js";
import createHttpError from "http-errors";

//CREATE
const createNewNote = async (req, res, next) => {
  const { content } = req.body;
  const userId = req.user._id; // from JWT
  const runId = req.params.runId;

  if (!content) {
    throw new createHttpError(400, "Missing content for new note.", {
      expose: true,
    });
  }

  try {
    const note = await noteHandler.createNewNote(content, userId, runId);
    res.status(201).json(note); // return the created note
  } catch (err) {
    next(err);
  }
};

//READ
const getNote = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    const note = await noteHandler.getNote(noteId);

    if (!note) return res.status(404).json({ message: "Note not found." });

    // Authorization check
    if (note.userId.toString() !== req.user._id.toString()) {
      throw new createHttpError(
        403,
        "You do not have permission to access this note.",
        { expose: true }
      );
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

//UPDATE
const toggleOpen = async (req, res, next) => {
  const noteId = req.params.noteId;
  const userId = req.user._id.toString();

  try {
    await noteHandler.toggleOpen(noteId, userId);
    res.status(200).json({ message: "Note open status toggled successfully." });
  } catch (err) {
    next(err);
  }
};

const updateNote = async (req, res, next) => {
  const noteId = req.params.noteId;
  const userId = req.user._id.toString();

  if (!req.body.content) {
    throw new createHttpError(400, "Missing content for update.", {
      expose: true,
    });
  }

  const updatedContent = req.body.content;

  try {
    const updatedNote = await noteHandler.updateNote(
      noteId,
      updatedContent,
      userId
    );
    res
      .status(200)
      .json({ message: "Note updated successfully.", note: updatedNote });
  } catch (err) {
    next(err);
  }
};

//DELETE
const deleteNote = async (req, res, next) => {
  const noteId = req.params.noteId;
  const userId = req.user._id.toString();

  try {
    await noteHandler.deleteNote(noteId, userId);
    res.status(200).json({ message: "Note deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export default {
  createNewNote,
  getNote,
  toggleOpen,
  updateNote,
  deleteNote,
};
