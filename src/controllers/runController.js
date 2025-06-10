import runHandler from "../handlers/runHandler.js";
import noteHandler from "../handlers/noteHandler.js";
import createHttpError from "http-errors";

//CREATE

const createNewRunWithNote = async (req, res, next) => {
  //Create a new run with a new note, update associated user current run fields

  const userId = req.user.id;

  //If the request has been sent with another field in the body, generate an error
  if (!req.body.content) {
    throw new createHttpError(
      400,
      "Something went wrong with creating this run.",
      { expose: true }
    );
  }

  const content = req.body.content;

  const payload = { userId };

  if (req.body.title) {
    payload.title = req.body.title;
  } // if a title is sent in the body, add it to the payload

  try {
    const run = await runHandler.createNewRunWithNote(payload, content);
    res.redirect(303, `/run/${run._id}`);
  } catch (err) {
    next(err);
  }
};

const createNewRun = async (req, res) => {
  //Create a new run, update associated user tot_runs and current_run fields

  const userId = req.user.id;
  const payload = { userId };

  if (req.body) {
    payload.title = req.body.title;
  } // if a title is sent in the body, add it to the payload

  const run = await runHandler.createNewRun(payload);

  //redirect to the new run page
  res.redirect(303, `/run/${run._id}`);
};

//READ

const getRunNotes = async (req, res) => {
  //FUNCTION: return an array of notes for a given run in JSON format

  const runId = req.params.runId;

  const notes = await runHandler.getRunNotes(runId);

  //Authorization check: If the note.userId is not the same as req.user, send an error message.
  if (!notes[0].userId.toString() == req.user._id.toString()) {
    throw new createHttpError(
      403,
      "You do not have permission to access this",
      { expose: true }
    );
  }

  //If there are no notes, say so.
  if (notes.length === 0) {
    res.status(404).json({ message: "No notes found for this run." });
    return;
  }

  res.status(200).json(notes);
};

const getRun = async (req, res) => {
  //FUNCTION: return one run object in JSON format

  const runId = req.params.runId;

  const run = await runHandler.getRun(runId);

  //Check authorization - throw an error out to catchErrors if req.user is not the owner of the run.
  if (!run.userId.toString() == req.user._id.toString()) {
    throw new createHttpError(
      403,
      "You do not have permission to access this",
      { expose: true }
    );
  }

  res.status(200).json(run);
};

//UPDATE
const updateRun = async (req, res) => {
  //FUNCTION: Update the title of a given run
  const runId = req.params.runId;
  const userId = req.user.id.toString();

  //If the request has been sent with another field in the body, generate an error
  if (!req.body.title) {
    throw new createHttpError(400, "Something went wrong updating your run.", {
      expose: true,
    });
  }
  const title = req.body.title; // should be something like {title: "My first run"}

  await runHandler.updateRun(runId, title, userId);
  res.redirect(303, `/run/${runId}`);
};

//DELETE

const deleteRunNotes = async (req, res, next) => {
  const runId = req.params.runId;
  const userId = req.user.id.toString();

  await runHandler.deleteRunNotes(runId, userId);
  req.flash("success", "The notes for this run have been deleted.");
  res.redirect(303, `/run/${runId}`);
};

const deleteRun = async (req, res) => {
  const runId = req.params.runId;
  const userId = req.user.id.toString();
  console.log("controller userId:", userId);

  await runHandler.deleteRun(runId, userId);
  req.flash("success", "Run deleted.");
  res.redirect(303, "/dashboard");
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
