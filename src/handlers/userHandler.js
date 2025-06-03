import User from "../models/userSchema.js";
import Run from "../models/runSchema.js";
import Note from "../models/noteSchema.js";

import mongoose from "mongoose";
import plm from "passport-local-mongoose";
import ArraySort from "array-sort";
import createHttpError from "http-errors";

//CREATE

const register = async (email, password, username) => {
  // Register a new user
  const user = new User({
    email,
    username,
  });

  try {
    const registeredUser = await User.register(user, password);
    return registeredUser;
  } catch (err) {
    // Check for specific error and provide custom messages
    if (err.name === "MissingPasswordError") {
      throw createHttpError(400, "Password must exist");
    }
    if (err.name === "UserExistsError") {
      throw createHttpError(409, "User with this email already exists");
    }
    if (err.name === "IncorrectPasswordError") {
      throw new Error("Incorrect password.");
    }
    if (err.name === "IncorrectUsernameError") {
      throw new Error("Incorrect email.");
    }

    // Catch any unexpected errors
    throw err; // Propagate other errors
  }
};

const login = async (email, password) => {
  // Login a user
  const authentication = await User.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  })(email, password);
  if (!authentication.user || authentication.error) {
    throw createHttpError(
      401,
      `Login failed: ${authentication.error?.message}` || "Login failed"
    );
  }
  return authentication;
};

//READ

const getThisUserRuns = async (userId, pageNumber) => {
  const limit = pageNumber * 10;
  const skip = limit - 10;
  //FUNCTION: Finds the runs for a given userId based on page number and returns them as an array
  return await Run.find({ userId })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  // return ArraySort(runs, "updatedAt", { reverse: true });
};

const getThisUserRunIds = async (userId) => {
  //FUNCTION: returns an array of runIds for a given user
  return await Run.distinct("_id", { userId });
};

const getUser = async (userId) => {
  //FUNCTION: return one user

  return await User.findOne({ _id: userId }).lean();
};

//UPDATE

const updateUser = async (userId, keyValue) => {
  //FUNCTION: takes a {key:value} pair like {tot_notes: "0"} and updates the corresponding document parameter

  //Use try/catch here to gracefully handle duplicate email errors.
  try {
    const updatedUser = await User.updateOne(
      { _id: userId },
      { $set: keyValue }
    );
    return updatedUser;
  } catch (err) {
    if (err.code == 11000) {
      throw new createHttpError(
        409,
        "An account with this email already exists."
      );
    }
    throw err;
  }
};

const setUserPassword = async (userId, newPassword) => {
  //FUNCTION: sets a new password for a user

  const user = await User.findOne({ _id: userId });

  const updatedUser = await user.setPassword(newPassword);

  return updatedUser;
};

const updatePassword = async (
  userId,
  currentPassword,
  newPassword,
  confirmPassword
) => {
  //change user password

  if (newPassword !== confirmPassword) {
    throw createHttpError(
      400,
      "New password does not match confirmed password."
    );
  }
  if (newPassword == currentPassword) {
    throw createHttpError(
      400,
      "New password cannot be the same as your current password"
    );
  }

  const user = await User.findOne({ _id: userId });

  await user.changePassword(currentPassword, newPassword);
};

//DELETE

const deleteUserContent = async (userId) => {
  //FUNCTION: deletes all runs and notes associated with a user, sets tot_runs and tot_notes for a user to zero

  await Note.deleteMany({ userId });
  await Run.deleteMany({ userId });

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        tot_notes: 0,
        tot_runs: 0,
        tot_open_notes: 0,
        current_run: null,
        currentRunUpdatedAt: null,
      },
    }
  );
  return;
};

const deleteUser = async (userId) => {
  //FUNCTION: deletes one user, associated runs and notes
  await deleteUserContent(userId);

  return await User.deleteOne({ _id: userId });
};

export default {
  register,
  login,
  getThisUserRuns,
  getThisUserRunIds,
  getUser,
  updateUser,
  updatePassword,
  setUserPassword,
  deleteUserContent,
  deleteUser,
};
