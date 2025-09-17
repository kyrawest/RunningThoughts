import { Router } from "express";
import { validateNoteId } from "../../validators/validators.js";
import { catchErrors } from "../../handlers/errorHandlers.js";
import { isLoggedIn, isAuthorized, verifyJWT } from "../../auth/auth.js";

import noteController from "../../controllers/mobile/noteController.js";

const noteRouter = Router();

//CREATE

// Create a new note associated with a given runId
noteRouter.post(
  "/:runId",
  (req, res, next) => {
    console.log(`📝 POST /notes/${req.params.runId} - Creating new note`);
    next();
  },
  verifyJWT,
  (req, res, next) => {
    console.log(`📝 POST /notes/${req.params.runId} - Verified JWT`);
    next();
  },
  catchErrors(noteController.createNewNote)
);

//READ

noteRouter.get(
  "/:noteId",
  isLoggedIn,
  validateNoteId,
  catchErrors(noteController.getNote)
);

//UPDATE

noteRouter.put(
  //Toggle the "open" property on a note document, update associated run+user
  "/toggle-open/:noteId",
  isLoggedIn,
  validateNoteId,
  catchErrors(noteController.toggleOpen)
);

noteRouter.put(
  //Update note content
  "/:noteId",
  isLoggedIn,
  validateNoteId,
  catchErrors(noteController.updateNote)
);

//DELETE

noteRouter.delete(
  //Delete a note, updated associated run + user
  "/:noteId",
  isLoggedIn,
  validateNoteId,
  catchErrors(noteController.deleteNote)
);

export default noteRouter;
