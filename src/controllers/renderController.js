import runHandler from "../handlers/runHandler.js";
import userHandler from "../handlers/userHandler.js";
import noteHandler from "../handlers/noteHandler.js";

import createHttpError from "http-errors";

const login = (req, res) => {
  res.render("login");
};

const register = (req, res) => {
  res.render("register");
};

const dashboard = async (req, res) => {
  //Renders dashboard page, passes run JSON data to the frontend
  const username = req.user.username;
  const user = req.user;

  //dashboard has pagination: displays 10 runs at a time. By default it will open to page 1 unless specified in req.query
  let pageNumber = 1;
  if (req.query.page) {
    pageNumber = req.query.page;
  }

  //get runs for the user - expects an array of run objects (max 10 objects).
  const runs = await userHandler.getThisUserRuns(req.user._id, pageNumber);

  // For each run in the runs array, also add the notes for that run.
  // Use Promise.all to resolve all async operations in parallel - keeps the map function from failing out
  await Promise.all(
    runs.map(async (run) => {
      run.notes = await runHandler.getRunNotes(run._id);
    })
  );

  // Render the page with our gathered data.
  res.render("dashboard", {
    title: "Dashboard",
    runs,
    pageNumber,
  });
};

const runPage = async (req, res) => {
  //Render the "run page": a page that sows the run info for a given run + notes for that run.

  const user = req.user;
  const runId = req.params.runId;

  //Get the run data (JSON)
  const run = await runHandler.getRun(runId);

  // Check user authorization. req.user should match run.userId.
  if (run.userId.toString() !== user.id.toString()) {
    throw new createHttpError(
      403,
      "You do not have permission to access this.",
      { expose: true }
    );
  }

  const notes = await runHandler.getRunNotes(runId);

  res.render("run", { run, notes, title: "Run", user });
};

const accountSettings = async (req, res) => {
  res.render("account-settings");
};

export default {
  login,
  register,
  dashboard,
  runPage,
  accountSettings,
};
