import runHandler from "../handlers/runHandler.js";
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

  try {
    const run = await runHandler.createNewRun(payload);
    res.status(201).json(`New run created`, run);
  } catch (err) {
    next(err);
  }
};

//READ

const getRunNotes = async (req, res, next) => {
  //FUNCTION: return an array of notes for a given run

  const runId = req.params.runId;

  try {
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
  } catch (err) {
    next(err);
  }
};

const getRun = async (req, res, next) => {
  //FUNCTION: return one run

  const runId = req.params.runId;

  try {
    const run = await runHandler.getRun(runId);
    if (!run.userId.toString() == req.user._id.toString()) {
      res
        .status(403)
        .json({ message: "You do not have permission to access this" });
      return;
    }
    res.status(200).json(run);
  } catch (err) {
    next(err);
  }
};

//UPDATE
const updateRun = async (req, res, next) => {
  const runId = req.params.runId;
  const keyValue = req.body; // should be something like {title: "My first run"}
  const userId = req.user.id.toString();

  try {
    const updatedRun = await runHandler.updateRun(runId, keyValue, userId);
    res.status(200).json(updatedRun);
  } catch (err) {
    next(err);
  }
};

//DELETE

const deleteRunNotes = async (req, res, next) => {
  const runId = req.params.runId;
  const userId = req.user.id.toString();

  try {
    await runHandler.deleteRunNotes(runId, userId);
    res.status(204).json("Notes deleted");
  } catch (err) {
    next(err);
  }
};

const deleteRun = async (req, res, next) => {
  const runId = req.params.runId;
  const userId = req.user.id.toString();

  try {
    await runHandler.deleteRun(runId, userId);
    res.status(204).json("Run and associated notes deleted");
  } catch (err) {
    next(err);
  }
};

export default {
  createNewRun,
  getRunNotes,
  getRun,
  updateRun,
  deleteRunNotes,
  deleteRun,
};
