import User from "../models/userSchema.js";
import Run from "../models/runSchema.js";
import Note from "../models/noteSchema.js";

//CREATE

const createNewRun = async ({ userId, title = "" }) => {
  const newRun = await Run.create({ userId, title });
  await User.updateOne({ _id: userId }, { $inc: { tot_runs: 1 } });
  return newRun;
};

//READ

const getRunNotes = async (runId) => {
  //FUNCTION: returns all the notes associated with a given run
  return await Note.find({ runId }).lean();
};

const getRun = async (runId) => {
  //FUNCTION: return one run
  return await Run.findOne({ _id: runId }).lean();
};

//UPDATE

const updateRun = async (runId, keyValue, loggedUserId) => {
  //FUNCTION: takes a {key:value} pair like {title: "Hello"} and updates the corresponding document parameter

  const run = await getRun(runId);
  const userId = run.userId.toString();

  if (loggedUserId !== userId) {
    throw new Error("You do not have permission to access this");
  }

  const updatedRun = await Run.updateOne({ _id: runId }, { $set: keyValue });
  return updatedRun;
};

//DELETE

const deleteRunNotes = async (runId, loggedUserId) => {
  //FUNCTION: delete all notes associated with a run, then update the total notes for that run and associated user

  const run = await getRun(runId);
  const userId = run.userId.toString();

  if (loggedUserId !== userId) {
    throw new Error("You do not have permission to access this");
  }

  const runNotesInt = run.tot_notes;

  await Note.deleteMany({ runId });

  await Run.updateOne({ _id: runId }, { $set: { tot_notes: 0 } });
  await User.updateOne({ _id: userId }, { $inc: { tot_notes: runNotesInt } });
};

const deleteRun = async (runId, loggedUserId) => {
  //FUNCTION: delete a Run associated with this id, reduce tot_runs in associated user, and delete associated notes
  const run = await getRun(runId);
  const userId = run.userId.toString();

  if (loggedUserId !== userId) {
    throw new Error("You do not have permission to access this");
  }
  await deleteRunNotes(runId, loggedUserId);
  await Run.deleteOne({ _id: runId });
  await User.updateOne({ _id: userId }, { $inc: { tot_runs: -1 } });
};

export default {
  createNewRun,
  getRunNotes,
  getRun,
  updateRun,
  deleteRunNotes,
  deleteRun,
};
