import { Router } from "express";
import {
  validateEmail,
  validatePassword,
  validateNewPassword,
  validateUsername,
  validateUserId,
} from "../validators/validators.js";
import { catchErrors } from "../handlers/errorHandlers.js";
import { isLoggedIn, isAuthorized } from "../auth/auth.js";

import userController from "../controllers/userController.js";

const userRouter = Router();

//CREATE

userRouter.post(
  "/register",
  validateEmail,
  validatePassword,
  validateUsername,
  catchErrors(userController.register)
);

userRouter.post("/login", validateEmail, userController.login);
userRouter.post("/logout", isLoggedIn, catchErrors(userController.logout));

//READ

userRouter.get(
  "/all-runs/:userId",
  isLoggedIn,
  validateUserId,
  isAuthorized, //checks if req.params.userId == req.user.id
  catchErrors(userController.getThisUserRuns)
); //get all run objects for a user. Returns JSON. not used in current frontend but may be useful for fetch request in future buildouts.

userRouter.get(
  "/all-run-ids/:userId",
  isLoggedIn,
  validateUserId,
  isAuthorized,
  catchErrors(userController.getThisUserRunIds)
); //get just the runIds for a user. Returns JSON. not used in current frontend but may be useful for fetch request in future buildouts.

//UPDATE

userRouter.put(
  "/update-password/:userId",
  isLoggedIn,
  isAuthorized,
  validateNewPassword,
  catchErrors(userController.updatePassword)
);

// Only comment back in for development - can be used to update passwords without knowing the old password
// userRouter.put(
//   "/set-password/:userId",
//   catchErrors(userController.setPassword)
// );

userRouter.put(
  "/email/:userId",
  isLoggedIn,
  validateUserId,
  validateEmail,
  isAuthorized,
  catchErrors(userController.updateEmail)
); //update a given user's email

userRouter.put(
  "/username/:userId",
  isLoggedIn,
  validateUserId,
  validateUsername,
  isAuthorized,
  catchErrors(userController.updateUsername)
); //update a given user's username

//DELETE

userRouter.delete(
  "/delete-content/:userId",
  isLoggedIn,
  isAuthorized,
  catchErrors(userController.deleteUserContent)
); //delete runs+notes for a user, updates the user to reflect this

userRouter.delete(
  "/:userId",
  isLoggedIn,
  validateUserId,
  isAuthorized,
  catchErrors(userController.deleteUser)
); //delete a user and all associated runs + notes

export default userRouter;
