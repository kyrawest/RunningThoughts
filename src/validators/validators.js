import { body } from "express-validator";
import mongoose from "mongoose";
import createHttpError from "http-errors";

export const validateEmail = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
];

export const validatePassword = [
  body("password" || "newPassword")
    .exists()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character"),
];

export const validateNewPassword = [
  body("newPassword")
    .exists()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character"),
];

export const validateUsername = [
  body("username")
    .exists()
    .withMessage("Username is required")
    .isLength({ min: 1, max: 20 })
    .withMessage("Username must be between 1 and 20 characters")
    .matches(/^[a-zA-Z]+$/)
    .withMessage(
      "Username must must be letters, no numbers or special characters"
    ),
];

export const validateUserId = (req, res, next) => {
  //Checks if there is a valid userId in the request parameters.
  //If not, throws a 404 error.
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId?.trim?.())) {
    //trims whitespace from userId if needed
    console.log("Error: invalid userId in url.");
    throw createHttpError(
      404,
      "Looks like we took a wrong turn, we can't find what you're looking for."
    );
  }

  next();
};

export const validateRunId = (req, res, next) => {
  //Checks if there is a valid runId in the request parameters.
  //If not, throws a 404 error.
  const runId = req.params.runId;

  if (!mongoose.Types.ObjectId.isValid(runId?.trim?.())) {
    //trims whitespace from runId if needed
    console.log("Error: invalid runId in url.");
    throw createHttpError(
      404,
      "Looks like we took a wrong turn, we can't find what you're looking for."
    );
  }

  next();
};

export const validateNoteId = (req, res, next) => {
  //Checks if there is a valid noteId in the request parameters.
  //If not, throws a 404 error.
  const noteId = req.params.noteId;

  if (!mongoose.Types.ObjectId.isValid(noteId?.trim?.())) {
    //trims whitespace from noteId if needed
    console.log("Error: invalid noteId in url.");
    throw createHttpError(
      404,
      "Looks like we took a wrong turn, we can't find what you're looking for."
    );
  }

  next();
};
