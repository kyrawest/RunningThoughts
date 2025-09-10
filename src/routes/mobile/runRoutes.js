import { Router } from "express";
import { validateRunId } from "../../validators/validators.js";
import { catchErrors } from "../../handlers/errorHandlers.js";
import { verifyJWT } from "../../auth/auth.js";

import runController from "../../controllers/mobile/runController.js";

const runRouter = Router();

//======================
// CREATE
//======================

// Create a new run with a note
runRouter.post(
  "/with-note",
  verifyJWT,
  catchErrors(runController.createNewRunWithNote)
);

// Create just a new run, update associated user tot_runs and current_run fields
runRouter.post("/", verifyJWT, catchErrors(runController.createNewRun));

//======================
// READ
//======================

// Get all notes for a given run
runRouter.get(
  "/notes/:runId",
  verifyJWT,
  catchErrors(validateRunId),
  catchErrors(runController.getRunNotes)
);

// Get a given run in JSON format
runRouter.get(
  "/:runId",
  verifyJWT,
  catchErrors(validateRunId),
  catchErrors(runController.getRun)
);

//======================
// UPDATE
//======================

// Update a given run title
runRouter.put(
  "/:runId",
  verifyJWT,
  catchErrors(validateRunId),
  catchErrors(runController.updateRun)
);

//======================
// DELETE
//======================

// Delete all notes associated with a run
runRouter.delete(
  "/:runId/notes",
  verifyJWT,
  validateRunId,
  catchErrors(runController.deleteRunNotes)
);

// Delete a run (also deletes all associated notes)
runRouter.delete(
  "/:runId",
  verifyJWT,
  validateRunId,
  catchErrors(runController.deleteRun)
);

export default runRouter;
