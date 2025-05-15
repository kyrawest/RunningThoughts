import { Router } from "express";
import { validateRunId } from "../validators/userValidator.js";
import { catchErrors } from "../handlers/errorHandlers.js";
import { isLoggedIn, isAuthorized } from "../auth/auth.js";

import runController from "../controllers/runController.js";

const runRouter = Router();

//CREATE
runRouter.post("/newRun", isLoggedIn, catchErrors(runController.createNewRun)); //Create a new run

//READ

runRouter.get(
  "/for-run/:runId",
  isLoggedIn,
  catchErrors(runController.getRunNotes)
); //get all notes for a given run

runRouter.get(
  "/:runId",
  isLoggedIn,
  validateRunId,
  catchErrors(runController.getRun)
); //get a given run

//UPDATE
runRouter.put(
  "/:runId",
  isLoggedIn,
  validateRunId,
  catchErrors(runController.updateRun)
); //update a given run

//DELETE

runRouter.delete(
  "/:runId/notes",
  isLoggedIn,
  validateRunId,
  catchErrors(runController.deleteRunNotes)
); //delete all notes associated with a run

runRouter.delete(
  "/:runId",
  isLoggedIn,
  validateRunId,
  catchErrors(runController.deleteRun)
); //delete a run (also deletes all associated notes)

export default runRouter;
