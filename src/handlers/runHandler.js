import User from "../models/userSchema.js";
import Run from "../models/runSchema.js";
import Note from "../models/noteSchema.js";
import santitizeHtml from "sanitize-html";

//CREATE

const createNewRun = async ({ userId, title = "" }) => {
  title = santitizeHtml(title, { allowedTags: [], allowedAttributes: {} });

  const newRun = await Run.create({ userId, title });
  await User.updateOne(
    { _id: userId },
    { $inc: { tot_runs: 1 }, $set: { current_run: newRun._id } }
  );
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

const updateRun = async (runId, title, loggedUserId) => {
  //FUNCTION: takes a {key:value} pair like {title: "Hello"} and updates the corresponding document parameter

  const run = await getRun(runId);
  const userId = run.userId.toString();

  if (loggedUserId !== userId) {
    throw new Error("You do not have permission to access this");
  }

  title = santitizeHtml(title, { allowedTags: [], allowedAttributes: {} });

  const updatedRun = await Run.updateOne(
    { _id: runId },
    { $set: { title } }
  ).lean();
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

  const open = run.tot_open_notes;

  await Run.updateOne({ _id: runId }, { $set: { tot_notes: 0 } });
  await User.updateOne(
    { _id: userId },
    { $inc: { tot_notes: -runNotesInt, tot_open_notes: -open } }
  );
};

const deleteRun = async (runId, loggedUserId) => {
  //FUNCTION: delete a Run associated with this id, reduce tot_runs in associated user, and delete associated notes
  const run = await getRun(runId);
  const userId = run.userId.toString();

  if (loggedUserId !== userId) {
    throw new Error("You do not have permission to access this");
  }

  //get the current run for this user so we can check if we need to reset it later
  const user = await User.findById(userId).select("current_run").lean();
  const current_run = user?.current_run;

  await deleteRunNotes(runId, loggedUserId);
  await Run.deleteOne({ _id: runId });
  if (current_run == runId) {
    await User.updateOne(
      { _id: userId },
      {
        $inc: { tot_runs: -1 },
        $set: { current_run: null, currentRunUpdatedAt: null },
      }
    );
  } else {
    await User.updateOne({ _id: userId }, { $inc: { tot_runs: -1 } });
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
