import runHandler from "../handlers/runHandler.js";
import userHandler from "../handlers/userHandler.js";
import noteHandler from "../handlers/noteHandler.js";

const login = (req, res) => {
  res.render("login");
};

const register = (req, res) => {
  res.render("register");
};

const dashboard = async (req, res) => {
  const username = req.user.username;
  const user = req.user;
  let pageNumber = 1;
  if (req.query.page) {
    pageNumber = req.query.page;
  }
  const runs = await userHandler.getThisUserRuns(req.user._id, pageNumber);

  // Use Promise.all to resolve all async operations in parallel
  await Promise.all(
    runs.map(async (run) => {
      run.notes = await runHandler.getRunNotes(run._id);
    })
  );

  res.render("dashboard", {
    title: "Dashboard",
    username,
    user,
    runs,
    pageNumber,
  });
};

const runPage = async (req, res) => {
  //FUNCTION: return one run
  // This function is used to render the run page in the frontend
  // It is not used in the API
  const runId = req.params.runId;
  const run = await runHandler.getRun(runId);
  const user = req.user;
  if (!run.userId.toString() == req.user._id.toString()) {
    res
      .status(403)
      .json({ message: "You do not have permission to access this" });
    return;
  }

  const notes = await runHandler.getRunNotes(runId);

  res.render("run", { run, notes, title: "Run", user });
};

const editNotePage = async (req, res) => {
  const noteId = req.params.noteId;
  const note = await noteHandler.getNote(noteId);

  if (!note) {
    res.status(404).json({ message: "Note not found" });
    return;
  }

  if (!note.userId.toString() == req.user._id.toString()) {
    res
      .status(403)
      .json({ message: "You do not have permission to access this" });
    return;
  }

  res.render("edit-note", { note, noteId });
};

const newNotePage = async (req, res) => {
  const runId = req.params.runId;
  const run = await runHandler.getRun(runId);

  if (!run.userId.toString() == req.user._id.toString()) {
    res
      .status(403)
      .json({ message: "You do not have permission to access this" });
    return;
  }

  res.render("new-note", { run, runId });
};

const accountSettings = async (req, res) => {
  res.render("account-settings");
};

export default {
  login,
  register,
  dashboard,
  runPage,
  editNotePage,
  newNotePage,
  accountSettings,
};
