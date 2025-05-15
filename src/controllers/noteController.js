import noteHandler from "../handlers/noteHandler.js";
import { validationResult } from "express-validator";
const { createHttpError } = "http-errors";

//CREATE
const createNewNote = async (req, res, next) => {
  const { content, runId } = req.body;
  const userId = req.user.id;

  try {
    await noteHandler.createNewNote(content, userId, runId);
    res.status(201).json("New note created");
  } catch (err) {
    next(err);
  }
};

//READ

const getNote = async (req, res, next) => {
  //FUNCTION: return one note

  const noteId = req.params.noteId;

  try {
    const note = await noteHandler.getNote(noteId);
    if (!note.userId.toString() == req.user._id.toString()) {
      res
        .status(403)
        .json({ message: "You do not have permission to access this" });
      return;
    }
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

//UPDATE

const updateNote = async (req, res, next) => {
  //FUNCTION: update content of a give note

  const noteId = req.params.noteId;
  const updatedContent = req.body.updatedContent;
  const userId = req.user.id.toString();

  try {
    const updatedNote = await noteHandler.updateNote(
      noteId,
      updatedContent,
      userId
    );
    res.status(200).json(updatedNote);
  } catch (err) {
    next(err);
  }
};

//DELETE

const deleteNote = async (req, res, next) => {
  const noteId = req.params.noteId;
  const userId = req.user.id.toString();

  try {
    await noteHandler.deleteNote(noteId, userId);
    res.status(204).json("Note deleted");
  } catch (err) {
    next(err);
  }
};

export default {
  createNewNote,
  getNote,
  updateNote,
  deleteNote,
};
