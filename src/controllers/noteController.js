import noteHandler from "../handlers/noteHandler.js";
const { createHttpError } = "http-errors";

//CREATE
const createNewNote = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;
  const runId = req.params.runId;

  await noteHandler.createNewNote(content, userId, runId);
  res.redirect(303, `/run/${runId}`);
};

//READ

const getNote = async (req, res) => {
  //FUNCTION: Return one note in JSON format.
  // This application does not render pages with a single note, so this is left as an endpoint
  // so that if needed, the data could be fetched by an authorized user.

  const noteId = req.params.noteId;

  const note = await noteHandler.getNote(noteId);

  //Check if the noteId belongs to the authenticated user. Throw an error if not.
  if (!note.userId.toString() == req.user._id.toString()) {
    throw new createHttpError(
      403,
      "You do not have permission to access this",
      { expose: true }
    );
  }

  res.status(200).json(note);
};

//UPDATE

const toggleOpen = async (req, res) => {
  //FUNCTION: toggle open status of a given note, and tot_open_notes fields of associate run and user
  //Authentication handled in handler

  const noteId = req.params.noteId;
  const userId = req.user.id.toString();

  await noteHandler.toggleOpen(noteId, userId);

  //This function does NOT send a page redirect or refresh as this is disruptive to user experience.
  res.status(200).send();
};

const updateNote = async (req, res) => {
  //FUNCTION: update content of a give note
  //User authorizatiom is checked in the handler

  const noteId = req.params.noteId;
  const userId = req.user.id.toString();

  //If the request has been sent with another field in the body, generate an error
  if (!req.body.content) {
    throw new createHttpError(
      400,
      "Something went wrong with updating this note.",
      { expose: true }
    );
  }

  const updatedContent = req.body.content;

  const updatedNote = await noteHandler.updateNote(
    noteId,
    updatedContent,
    userId
  );

  //redirect back to the page where the edit module was opened.
  const referer = req.get("Referer");
  let redirectPath = `/run/${updatedNote.runId}`; // default fallback: redirect back to the associate run page.

  if (referer) {
    const url = new URL(referer);
    // Get only the path and query string. This will preserve pagination on dashboard.
    redirectPath = url.pathname + url.search;
  }

  res.redirect(303, redirectPath);
};

//DELETE

const deleteNote = async (req, res) => {
  //FUNCTION: delete a given note, update tot_note, open fields in associated user and run
  const noteId = req.params.noteId;
  const userId = req.user.id.toString();

  await noteHandler.deleteNote(noteId, userId);

  //redirect back to the page where delete button was pushed.
  const referer = req.get("Referer");
  let redirectPath = "/dashboard"; // default fallback: redirect to dashboard.

  if (referer) {
    const url = new URL(referer);
    // Get only the path and query string. This will preserve pagination on dashboard.
    redirectPath = url.pathname + url.search;
  }
  req.flash("success", "Note deleted.");
  res.redirect(303, redirectPath);
};

export default {
  createNewNote,
  getNote,
  toggleOpen,
  updateNote,
  deleteNote,
};
