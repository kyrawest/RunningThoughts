import { Router } from "express";
import { validateNoteId } from "../validators/userValidator.js";
import { catchErrors } from "../handlers/errorHandlers.js";
import { isLoggedIn, isAuthorized } from "../auth/auth.js";

import noteController from "../controllers/noteController.js";

const noteRouter = Router();

//CREATE

noteRouter.post(
  "/new-note/:runId",
  isLoggedIn,
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
  "/toggle-open/:noteId",
  isLoggedIn,
  validateNoteId,
  catchErrors(noteController.toggleOpen)
);

noteRouter.put(
  "/:noteId",
  isLoggedIn,
  validateNoteId,
  catchErrors(noteController.updateNote)
);

//DELETE

noteRouter.delete(
  "/:noteId",
  isLoggedIn,
  validateNoteId,
  catchErrors(noteController.deleteNote)
);

export default noteRouter;
