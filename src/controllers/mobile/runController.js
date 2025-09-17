import runHandler from "../../handlers/runHandler.js";
import noteHandler from "../../handlers/noteHandler.js";
import createHttpError from "http-errors";

//CREATE

const createNewRunWithNote = async (req, res, next) => {
  const userId = req.user._id.toString();

  if (!req.body.content) {
    throw new createHttpError(400, "Missing content for this run.", {
      expose: true,
    });
  }

  const content = req.body.content;
  const payload = { userId };

  if (req.body.title) payload.title = req.body.title;

  try {
    const run = await runHandler.createNewRunWithNote(payload, content);
    res.status(201).json(run);
  } catch (err) {
    next(err);
  }
};

const createNewRun = async (req, res, next) => {
  const userId = req.user._id.toString();
  const payload = { userId };

  if (req.body.title) payload.title = req.body.title;

  try {
    const run = await runHandler.createNewRun(payload);
    res.status(201).json(run);
  } catch (err) {
    next(err);
  }
};

//READ

const getRunNotes = async (req, res, next) => {
  const runId = req.params.runId;

  try {
    const notes = await runHandler.getRunNotes(runId);

    if (notes.length === 0) {
      return res.status(404).json({ message: "No notes found for this run." });
    }

    // Authorization
    if (notes[0].userId.toString() !== req.user._id.toString()) {
      throw new createHttpError(
        403,
        "You do not have permission to access this",
        { expose: true }
      );
    }

    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
};

const getRun = async (req, res, next) => {
  const runId = req.params.runId;

  try {
    const run = await runHandler.getRun(runId);

    if (!run) return res.status(404).json({ message: "Run not found." });

    if (run.userId.toString() !== req.user._id.toString()) {
      throw new createHttpError(
        403,
        "You do not have permission to access this",
        { expose: true }
      );
    }

    res.status(200).json(run);
  } catch (err) {
    next(err);
  }
};

//UPDATE

const updateRun = async (req, res, next) => {
  const runId = req.params.runId;
  const userId = req.user._id.toString();

  if (!req.body.title) {
    throw new createHttpError(400, "Missing title for update.", {
      expose: true,
    });
  }

  try {
    await runHandler.updateRun(runId, req.body.title, userId);
    res.status(200).json({ message: "Run updated successfully." });
  } catch (err) {
    next(err);
  }
};

//DELETE

const deleteRunNotes = async (req, res, next) => {
  const runId = req.params.runId;
  const userId = req.user._id.toString();

  try {
    await runHandler.deleteRunNotes(runId, userId);
    res.status(200).json({ message: "Notes deleted successfully." });
  } catch (err) {
    next(err);
  }
};

const deleteRun = async (req, res, next) => {
  const runId = req.params.runId;
  const userId = req.user._id.toString();

  try {
    await runHandler.deleteRun(runId, userId);
    res.status(200).json({ message: "Run deleted successfully." });
  } catch (err) {
    next(err);
  }
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
