import noteHandler from "../handlers/noteHandler.js";
import { validationResult } from "express-validator";
const { createHttpError } = "http-errors";

//CREATE
const createNewNote = async (req, res, next) => {
  const { content } = req.body;
  const userId = req.user.id;
  const runId = req.params.runId;

  await noteHandler.createNewNote(content, userId, runId);
  res.redirect(303, `/run/${runId}`);
};

//READ

const getNote = async (req, res, next) => {
  //FUNCTION: return one note

  const noteId = req.params.noteId;

  const note = await noteHandler.getNote(noteId);
  if (!note.userId.toString() == req.user._id.toString()) {
    throw new createHttpError(403, "You do not have permission to access this");
  }
  res.status(200).json(note);
};

//UPDATE

const updateNote = async (req, res) => {
  //FUNCTION: update content of a give note

  const noteId = req.params.noteId;
  const updatedContent = req.body.content;
  const userId = req.user.id.toString();

  const updatedNote = await noteHandler.updateNote(
    noteId,
    updatedContent,
    userId
  );

  //redirect back to the page where delete button was pushed.
  const referer = req.get("Referer");
  let redirectPath = `/run/${updatedNote.runId}`; // default fallback

  if (referer) {
    const url = new URL(referer);
    // Get only the path and query string (e.g., /some/page?x=1)
    redirectPath = url.pathname + url.search;
  }

  res.redirect(303, redirectPath);
};

const toggleOpen = async (req, res, next) => {
  //FUNCTION: toggle open status of a given note

  const noteId = req.params.noteId;
  const userId = req.user.id.toString();

  await noteHandler.toggleOpen(noteId, userId);
  res.status(200).send();
};

//DELETE

const deleteNote = async (req, res, next) => {
  const noteId = req.params.noteId;
  const userId = req.user.id.toString();

  await noteHandler.deleteNote(noteId, userId);
  res.status(204);
  //redirect back to the page where delete button was pushed.
  const referer = req.get("Referer");
  let redirectPath = "/dashboard"; // default fallback

  if (referer) {
    const url = new URL(referer);
    // Get only the path and query string (e.g., /some/page?x=1)
    redirectPath = url.pathname + url.search;
  }

  res.redirect(redirectPath);
};

export default {
  createNewNote,
  getNote,
  updateNote,
  toggleOpen,
  deleteNote,
};
