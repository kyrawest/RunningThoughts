import User from "../models/userSchema.js";
import Run from "../models/runSchema.js";
import Note from "../models/noteSchema.js";
import sanitizeHtml from "sanitize-html";

import mongoose from "mongoose";
import createHttpError from "http-errors";

//for mobile auth
import jwt from "jsonwebtoken";

// Secret key for JWT (store securely in .env)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES_IN = "7d";

//CREATE

const register = async (email, password, username) => {
  // Register a new user

  //Sanitize username
  username = sanitizeHtml(username, {
    allowedTags: [],
    allowedAttributes: {},
  });
  username = username.trim().charAt(0).toUpperCase() + username.slice(1);

  //Generate user from schema
  const user = new User({
    email,
    username,
  });

  //catch passport specific errors
  try {
    await User.register(user, password);
  } catch (err) {
    if (err.name === "MissingPasswordError") {
      throw createHttpError(400, "Password must exist", { expose: true });
    }
    if (err.name === "UserExistsError") {
      throw createHttpError(409, "User with this email already exists", {
        expose: true,
      });
    }
    // Catch any errors not described here
    throw err;
  }
};

const login = async (email, password) => {
  // Login a user with passport
  console.log("Logging in user:", email);

  const authentication = await User.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  })(email, password);
  if (!authentication.user || authentication.error) {
    throw createHttpError(
      401,
      `Login failed: ${authentication.error?.message}` || "Login failed.",
      { expose: true }
    );
  }
  return authentication;
};

export const mobileLogin = async (email, password) => {
  // Passport-local-mongoose provides the authenticate method
  return new Promise((resolve, reject) => {
    User.authenticate()(email, password, (err, user, passwordError) => {
      if (err) return reject(err);
      if (passwordError || !user) {
        return reject(
          createHttpError(401, "Invalid email or password.", { expose: true })
        );
      }

      // User authenticated successfully -> generate JWT
      const payload = {
        id: user._id,
        email: user.email,
        username: user.username,
        current_run: user.current_run,
        currentRunUpdatedAt: user.currentRunUpdatedAt,
        tot_notes: user.tot_notes,
        tot_open_notes: user.tot_open_notes,
        tot_runs: user.tot_runs,
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      resolve({ user: payload, token });
    });
  });
};

//READ

const getThisUserRuns = async (userId, pageNumber) => {
  //FUNCTION: Finds the runs for a given userId based on page number and returns them as an array in JSON format
  // Returns max 10 runs according to pagination.

  const limit = pageNumber * 10;
  const skip = limit - 10;

  // sorts by most recent update
  return await Run.find({ userId })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const getThisUserRunIds = async (userId) => {
  //FUNCTION: returns an array of runIds for a given user
  return await Run.distinct("_id", { userId });
};

const getThisUserStats = async (userId) => {
  //FUNCTION: returns tot_notes, tot_open_notes, tot_runs, current_run, currentRunUpdatedAt
  //Returns in lean JSON format
  return await User.findOne({ _id: userId })
    .select("tot_notes tot_open_notes tot_runs current_run currentRunUpdatedAt")
    .lean();
};

//UPDATE

const updatePassword = async (
  userId,
  currentPassword,
  newPassword,
  confirmPassword
) => {
  //Update user password if they have given the correct old password and if their new password matches confirm password.

  if (newPassword !== confirmPassword) {
    throw createHttpError(
      400,
      "New password does not match confirmed password.",
      { expose: true }
    );
  }
  if (newPassword == currentPassword) {
    throw createHttpError(
      400,
      "New password cannot be the same as your current password",
      { expose: true }
    );
  }

  const user = await User.findOne({ _id: userId });

  await user.changePassword(currentPassword, newPassword);
};

const updateUser = async (userId, keyValue) => {
  //FUNCTION: takes a {key:value} pair like {username: "Kyra"} or email and updates the corresponding document parameter.

  //Using try/catch here to gracefully handle duplicate email errors.
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
        "An account with this email already exists.",
        { expose: true }
      );
    }
    throw err;
  }
};

// Only comment back in for development - can be used to update passwords without knowing the old password
// const setUserPassword = async (userId, newPassword) => {
//   //FUNCTION: sets a new password for a user

//   const user = await User.findOne({ _id: userId });

//   const updatedUser = await user.setPassword(newPassword);

//   return updatedUser;
// };

//DELETE

const deleteUserContent = async (userId) => {
  //FUNCTION: deletes all runs and notes associated with a user, sets tot_runs and tot_notes for a user to zero

  //Start mongoose transaction since we are altering multiple documents.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Note.deleteMany({ userId }).session(session);
    await Run.deleteMany({ userId }).session(session);

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
    ).session(session);

    //If all goes well, commit the transcation and end the function.
    await session.commitTransaction();
    session.endSession();
    return;
  } catch (error) {
    //if we tripped up during the transaction, don't commit any of these changes.
    await session.abortTransaction();
    session.endSession();
    throw error; // Throw the error out to controller.
  }
};

const deleteUser = async (userId) => {
  //FUNCTION: deletes one user, associated runs and notes
  await deleteUserContent(userId);

  return await User.deleteOne({ _id: userId });
};

export default {
  register,
  login,
  mobileLogin,
  getThisUserRuns,
  getThisUserRunIds,
  getThisUserStats,
  updateUser,
  updatePassword,
  // setUserPassword,
  deleteUserContent,
  deleteUser,
};
