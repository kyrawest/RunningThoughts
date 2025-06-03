import userHandler from "../handlers/userHandler.js";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

//CREATE
const register = async (req, res, next) => {
  //Register a new user
  const errors = validationResult(req);

  // if (!errors.isEmpty()) {
  //   // If errors exist, return a response with errors
  //   return next(createHttpError(400, { message: errors.array() }));
  // }

  if (!errors.isEmpty()) {
    console.log(errors);
    // Collect error messages into a flash array
    if (req.flash) {
      errors.array().forEach((err) => req.flash("error", err.msg));
    }

    // Redirect back to the registration form (or render, depending on your flow)
    return res.redirect("/register");
  }

  const { email, username, password } = req.body;

  const registeredUser = await userHandler.register(email, password, username); //will return a registered user

  req.flash("success", "You have made an account, please login!");
  res.redirect(303, "/login");
};

const login = async (req, res, next) => {
  //Login a user
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(createHttpError(400, { message: errors.array() }));
  }

  const { email, password } = req.body;

  try {
    const { user } = await userHandler.login(email, password);
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(200);
      res.redirect("/dashboard");
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/login");
};

//READ

const getThisUserRuns = async (req, res, next) => {
  //FUNCTION: return an array of notes for a given run

  const userId = req.params.userId;

  const runs = await userHandler.getThisUserRuns(userId);
  res.status(200).json(runs);
};

const getThisUserRunIds = async (req, res, next) => {
  //FUNCTION: returns an array of runIds for a given user

  const userId = req.params.userId;

  const runIds = await userHandler.getThisUserRunIds(userId);
  res.status(200).json(runIds);
};

const getUser = async (req, res, next) => {
  //FUNCTION: return one user
  const userId = req.params.userId;

  const user = await userHandler.getUser(userId);
  res.status(200).json(user);
};

//UPDATE

const updateUser = async (req, res, next) => {
  const userId = req.user.id;
  const keyValue = req.body; // should be something like {tot_runs: 0}
  console.log(keyValue);
  const updatedUser = await userHandler.updateUser(userId, keyValue);
  const key = Object.keys(keyValue)[1];
  console.log("key", key);
  if (key == "username") {
    req.flash("success", "Username updated!");
    res.status(303).redirect("/account-settings");
  } else if (key == "email") {
    req.flash("success", "Username updated!");
    res.status(303).redirect("/account-settings");
  } else {
    res.status(200).json(updatedUser);
  }
};

const updatePassword = async (req, res) => {
  //update user's password. requires the old password also be given.
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const { userId } = req.params;
  await userHandler.updatePassword(
    userId,
    currentPassword,
    newPassword,
    confirmPassword
  );
  req.flash("success", "Password updated!");
  res.status(303).redirect("/account-settings");
};

const setPassword = async (req, res, next) => {
  // set a new password for a user using passport-local-mongoose
  const userId = req.params.userId;
  const newPassword = req.body.newPassword;

  const updatedUser = await userHandler.setUserPassword(userId, newPassword);
  req.flash("success", "Password updated!");
  res.status(303).redirect("/account-settings");
};

//DELETE

const deleteUserContent = async (req, res, next) => {
  //FUNCTION: delete the runs+notes associated with a user, then set tot_runs and tot_notes to 0
  console.log("h");
  const userId = req.user.id;

  await userHandler.deleteUserContent(userId);
  res.status(204);
  req.flash(
    "success",
    "Your runs and notes have been deleted. New adventures await you!"
  );
  res.redirect("/dashboard");
};

const deleteUser = async (req, res, next) => {
  //FUNCTION: delete one user

  const userId = req.params.userId;

  await userHandler.deleteUser(userId);
  res.status(204).json("User deleted");
};

export default {
  register,
  login,
  logout,
  getThisUserRuns,
  getThisUserRunIds,
  getUser,
  updateUser,
  setPassword,
  updatePassword,
  deleteUserContent,
  deleteUser,
};
