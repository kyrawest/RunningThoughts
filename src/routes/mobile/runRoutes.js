import { Router } from "express";
import { validateRunId } from "../../validators/validators.js";
import { catchErrors } from "../../handlers/errorHandlers.js";
import { verifyJWT } from "../../auth/auth.js";
import passport from "../../handlers/passport.js";
import createHttpError from "http-errors";

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
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        // Force it through your error handler as JSON
        return next(createHttpError(401, "Unauthorized", { expose: true }));
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  catchErrors(validateRunId),
  catchErrors(runController.getRunNotes)
);

// Get a given run in JSON format
runRouter.get(
  "/:runId",
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        // Force it through your error handler as JSON
        return next(createHttpError(401, "Unauthorized", { expose: true }));
      }
      req.user = user;
      next();
    })(req, res, next);
  },
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
