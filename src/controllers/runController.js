import runHandler from "../handlers/runHandler.js";
import noteHandler from "../handlers/noteHandler.js";
import { validationResult } from "express-validator";
const { createHttpError } = "http-errors";

//CREATE
const createNewRun = async (req, res, next) => {
  //Create a new run

  const userId = req.user.id;

  const payload = { userId };

  if (req.body) {
    payload.title = req.body.title;
  } // if a title is sent in the body, add it to the payload

  const run = await runHandler.createNewRun(payload);
  res.status(201);
  res.redirect(`/run/${run._id}`);
};

//CREATE
const createNewRunWithNote = async (req, res, next) => {
  //Create a new run with a new note

  const userId = req.user.id;
  const content = req.body.content;

  const payload = { userId };

  if (req.body.title) {
    payload.title = req.body.title;
  } // if a title is sent in the body, add it to the payload

  try {
    const run = await runHandler.createNewRun(payload);
    await noteHandler.createNewNote(content, userId, run._id);
    res.status(201);
    res.redirect(`/run/${run._id}`);
  } catch (err) {
    next(err);
  }
};

//READ

const getRunNotes = async (req, res, next) => {
  //FUNCTION: return an array of notes for a given run

  const runId = req.params.runId;

  const notes = await runHandler.getRunNotes(runId);
  if (notes.length === 0) {
    res.status(404).json({ message: "No notes found for this run" });
    return;
  }
  if (!notes[0].userId.toString() == req.user._id.toString()) {
    res
      .status(403)
      .json({ message: "You do not have permission to access this" });
    return;
  }
  res.status(200).json(notes);
};

const getRun = async (req, res, next) => {
  //FUNCTION: return one run

  const runId = req.params.runId;

  const run = await runHandler.getRun(runId);
  if (!run.userId.toString() == req.user._id.toString()) {
    res
      .status(403)
      .json({ message: "You do not have permission to access this" });
    return;
  }
  res.status(200).json(run);
};

//UPDATE
const updateRun = async (req, res, next) => {
  const runId = req.params.runId;
  const title = req.body.title; // should be something like {title: "My first run"}
  const userId = req.user.id.toString();

  await runHandler.updateRun(runId, title, userId);
  res.status(200);
  res.redirect(303, `/run/${runId}`);
};

//DELETE

const deleteRunNotes = async (req, res, next) => {
  const runId = req.params.runId;
  const userId = req.user.id.toString();

  await runHandler.deleteRunNotes(runId, userId);
  res.status(204);
  res.redirect(`/run/${runId}`);
};

const deleteRun = async (req, res, next) => {
  const runId = req.params.runId;
  const userId = req.user.id.toString();

  await runHandler.deleteRun(runId, userId);
  res.status(204);
  res.redirect("/dashboard");
};

export default {
  createNewRun,
  createNewRunWithNote,
  getRunNotes,
  getRun,
  updateRun,
  deleteRunNotes,
  deleteRun,
};
