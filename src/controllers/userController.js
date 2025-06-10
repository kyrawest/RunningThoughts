import userHandler from "../handlers/userHandler.js";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

//CREATE
const register = async (req, res) => {
  //Register a new user
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    // Collect error messages into a flash array
    if (req.flash) {
      errors.array().forEach((err) => req.flash("error", err.msg));
    }

    // Redirect back to the registration form (or render, depending on your flow)
    return res.redirect("/register");
  }

  const { email, username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new createHttpError(400, "Your passwords do not match.", {
      expose: true,
    });
  }

  await userHandler.register(email, password, username); //will return a registered user

  req.flash("success", "You have made an account, please login!");
  res.redirect(303, "/login");
};

const login = async (req, res, next) => {
  //Login a user
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      createHttpError(400, { message: errors.array() }, { expose: true })
    ); //these express validatione errors are safe to show
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
  //Log out a user. Relies on passport.
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
};

//READ

const getThisUserRuns = async (req, res) => {
  //FUNCTION: return an array of notes for a given run, maximum 10 at a time.
  //This controller returns JSON.
  //Authorization should have already been checked in preceding route middleware.

  //Pagination functionality
  let pageNumber = 1;
  if (req.query.page) {
    pageNumber = req.query.page;
  }

  const userId = req.params.userId;

  const runs = await userHandler.getThisUserRuns(userId, pageNumber);
  res.status(200).json(runs);
};

const getThisUserRunIds = async (req, res) => {
  //FUNCTION: returns an array of runIds for a given user in JSON format.
  //Not currently implemented

  const userId = req.params.userId;

  const runIds = await userHandler.getThisUserRunIds(userId);

  res.status(200).json(runIds);
};

//UPDATE

const updatePassword = async (req, res) => {
  //FUNCTION: update user's password. Requires the old password also be given.
  if (
    !req.body.currentPassword ||
    !req.body.newPassword ||
    !req.body.confirmPassword
  ) {
    throw new createHttpError(
      400,
      "Something went wrong with updating your password.",
      { expose: true }
    );
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    if (req.flash) {
      errors.array().forEach((err) => req.flash("error", err.msg));
    }
    return res.redirect("/account-settings");
  }

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

const updateEmail = async (req, res) => {
  //Updates a pre-authorized user's email

  //make sure email is included in req.body
  if (!req.body.email) {
    throw new createHttpError(
      400,
      "Something went wrong with updating your email.",
      { expose: true }
    );
  }

  //check for email validatione errors from middleware
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    if (req.flash) {
      errors.array().forEach((err) => req.flash("error", err.msg));
    }
    return res.redirect("/account-settings");
  }

  //do the work
  const userId = req.user.id;
  const { email } = req.body;

  await userHandler.updateUser(userId, { email });

  req.flash("success", "Email updated. Please login again.");
  res.status(303).redirect("/account-settings");
};

const updateUsername = async (req, res) => {
  //Allows pre-authorized users to update username

  //make sure email is included in req.body
  if (!req.body.username) {
    throw new createHttpError(
      400,
      "Something went wrong with updating your name.",
      { expose: true }
    );
  }

  //check for email validatione errors from middleware
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    if (req.flash) {
      errors.array().forEach((err) => req.flash("error", err.msg));
    }
    return res.redirect("/account-settings");
  }

  const userId = req.user.id;
  const username = req.body.username;

  await userHandler.updateUser(userId, { username });

  req.flash("success", "Username updated!");
  res.status(303).redirect("/account-settings");
};

// Only comment back in for development - can be used to update passwords without knowing the old password
// const setPassword = async (req, res) => {
//   // set a new password for a user using passport-local-mongoose
//   const userId = req.params.userId;
//   const newPassword = req.body.newPassword;

//   const updatedUser = await userHandler.setUserPassword(userId, newPassword);
//   req.flash("success", "Password updated!");
//   res.status(303).redirect("/account-settings");
// };

//DELETE

const deleteUserContent = async (req, res) => {
  //FUNCTION: delete the runs+notes associated with a user, then set tot_runs and tot_notes to 0, current run attributes to null
  const userId = req.user.id;

  await userHandler.deleteUserContent(userId);
  req.flash(
    "success",
    "Your runs and notes have been deleted. New adventures await you!"
  );
  res.redirect(303, "/dashboard");
};

const deleteUser = async (req, res) => {
  //FUNCTION: delete one user

  const userId = req.params.userId;

  await userHandler.deleteUser(userId);
  req.flash(
    "success",
    "Your account has been deleted. We're sorry to see you go!"
  );
  res.redirect(303, "/register");
};

export default {
  register,
  login,
  logout,
  getThisUserRuns,
  getThisUserRunIds,
  updateEmail,
  updateUsername,
  // setPassword,
  updatePassword,
  deleteUserContent,
  deleteUser,
};
