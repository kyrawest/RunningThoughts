import { Router } from "express";
import { validateNoteId } from "../../validators/validators.js";
import { catchErrors } from "../../handlers/errorHandlers.js";
import { verifyJWT, isAuthorized, verifyJWT } from "../../auth/auth.js";

import noteController from "../../controllers/mobile/noteController.js";

const noteRouter = Router();

//CREATE

// Create a new note associated with a given runId
noteRouter.post(
  "/:runId",
  verifyJWT,
  catchErrors(noteController.createNewNote)
);

//READ

noteRouter.get(
  "/:noteId",
  verifyJWT,
  validateNoteId,
  catchErrors(noteController.getNote)
);

//UPDATE

noteRouter.put(
  //Toggle the "open" property on a note document, update associated run+user
  "/toggle-open/:noteId",
  verifyJWT,
  validateNoteId,
  catchErrors(noteController.toggleOpen)
);

noteRouter.put(
  //Update note content
  "/:noteId",
  verifyJWT,
  validateNoteId,
  catchErrors(noteController.updateNote)
);

//DELETE

noteRouter.delete(
  //Delete a note, updated associated run + user
  "/:noteId",
  verifyJWT,
  validateNoteId,
  catchErrors(noteController.deleteNote)
);

export default noteRouter;
