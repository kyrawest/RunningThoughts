import { Router } from "express";
import { validateRunId } from "../validators/validators.js";
import { catchErrors } from "../handlers/errorHandlers.js";
import { isLoggedIn } from "../auth/auth.js";

import runController from "../controllers/runController.js";

const runRouter = Router();

//CREATE

runRouter.post(
  "/with-note",
  isLoggedIn,
  catchErrors(runController.createNewRunWithNote)
); //Create a new run with a note

runRouter.post("/", isLoggedIn, catchErrors(runController.createNewRun)); //Create just a new run, update associated user tot_runs and current_run fields

//READ

runRouter.get(
  //Get all notes for a given run. May not be used in frontend, but left here for future proofing in case fetch requests for json needed in future.
  "/notes/:runId",
  isLoggedIn,
  catchErrors(validateRunId),
  catchErrors(runController.getRunNotes) //authorization handled in the controller
); //get all notes for a given run

runRouter.get(
  //Get a given run, returned in JSON format. May not be used in frontend, but left here for future proofing in case fetch requests for json needed in future.
  "/:runId",
  isLoggedIn,
  catchErrors(validateRunId),
  catchErrors(runController.getRun) //authorization handled in the controller
);

//UPDATE
runRouter.put(
  //Update a given run title
  "/:runId",
  isLoggedIn,
  catchErrors(validateRunId),
  catchErrors(runController.updateRun)
);

//DELETE

runRouter.delete(
  "/:runId/notes",
  isLoggedIn,
  validateRunId,
  catchErrors(runController.deleteRunNotes)
); //delete all notes associated with a run, updates the user note references

runRouter.delete(
  "/:runId",
  isLoggedIn,
  validateRunId,
  catchErrors(runController.deleteRun)
); //delete a run (also deletes all associated notes) and updates the user run/note references

export default runRouter;
