import { Router } from "express";
import {
  validateEmail,
  validatePassword,
  validateNewPassword,
  validateUsername,
  validateUserId,
} from "../../validators/validators.js";
import { catchErrors } from "../../handlers/errorHandlers.js";
import { verifyJWT, isAuthorized } from "../../auth/auth.js"; // JWT middleware

import userController from "../../controllers/mobile/userController.js";

const userRouter = Router();

//======================
// CREATE
//======================

userRouter.post(
  "/register",
  validateEmail,
  validatePassword,
  validateUsername,
  catchErrors(userController.register)
);

userRouter.post("/login", validateEmail, catchErrors(userController.login));

// For JWT, logout is client-side, but can optionally have an endpoint
userRouter.post("/logout", verifyJWT, catchErrors(userController.logout));

//======================
// READ
//======================

// Get all run objects for a user
userRouter.get(
  "/all-runs/:userId",
  verifyJWT,
  validateUserId,
  isAuthorized, // checks if req.params.userId === req.user._id
  catchErrors(userController.getThisUserRuns)
);

// Get just the run IDs for a user
userRouter.get(
  "/all-run-ids/:userId",
  verifyJWT,
  validateUserId,
  isAuthorized,
  catchErrors(userController.getThisUserRunIds)
);

userRouter.get(
  "/stats/:userId",
  verifyJWT,
  validateUserId,
  isAuthorized,
  catchErrors(userController.getThisUserStats)
);

//======================
// UPDATE
//======================

userRouter.put(
  "/update-password/:userId",
  verifyJWT,
  validateUserId,
  isAuthorized,
  validateNewPassword,
  catchErrors(userController.updatePassword)
);

// Update a user's email
userRouter.put(
  "/email/:userId",
  verifyJWT,
  validateUserId,
  validateEmail,
  isAuthorized,
  catchErrors(userController.updateEmail)
);

// Update a user's username
userRouter.put(
  "/username/:userId",
  verifyJWT,
  validateUserId,
  validateUsername,
  isAuthorized,
  catchErrors(userController.updateUsername)
);

//======================
// DELETE
//======================

// Delete runs + notes for a user
userRouter.delete(
  "/delete-content/:userId",
  verifyJWT,
  validateUserId,
  isAuthorized,
  catchErrors(userController.deleteUserContent)
);

// Delete a user and all associated runs + notes
userRouter.delete(
  "/:userId",
  verifyJWT,
  validateUserId,
  isAuthorized,
  catchErrors(userController.deleteUser)
);

export default userRouter;
