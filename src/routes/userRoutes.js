import { Router } from "express";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateUserId,
} from "../validators/userValidator.js";
import { catchErrors } from "../handlers/errorHandlers.js";
import { isLoggedIn, isAuthorized } from "../auth/auth.js";

import userController from "../controllers/userController.js";

const userRouter = Router();

//CREATE

//TODO: create logout route

userRouter.post(
  "/register",
  validateEmail,
  validatePassword,
  validateUsername,
  catchErrors(userController.register)
);

userRouter.post("/login", validateEmail, catchErrors(userController.login));

//READ

userRouter.get(
  "/all-runs/:userId",
  isLoggedIn,
  validateUserId,
  isAuthorized,
  catchErrors(userController.getThisUserRuns)
); //get all run objects for a user

userRouter.get(
  "/all-run-ids/:userId",
  isLoggedIn,
  validateUserId,
  isAuthorized,
  catchErrors(userController.getThisUserRunIds)
); //get just the runIds for a user

userRouter.get(
  "/info/:userId",
  isLoggedIn,
  validateUserId,
  isAuthorized,
  catchErrors(userController.getUser)
); //get a user info by id

//UPDATE

userRouter.put(
  "/:userId",
  isLoggedIn,
  validateUserId,
  isAuthorized,
  catchErrors(userController.updateUser)
); //update a given user

//DELETE

userRouter.delete(
  "/delete-content/",
  isLoggedIn,
  catchErrors(userController.deleteUserContent)
); //delete runs+notes for a user

userRouter.delete(
  "/:userId",
  isLoggedIn,
  validateUserId,
  isAuthorized,
  catchErrors(userController.deleteUser)
); //delete a user and all associated runs + notes

export default userRouter;
