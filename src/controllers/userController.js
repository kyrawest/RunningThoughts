import userHandler from "../handlers/userHandler.js";
import { validationResult } from "express-validator";
const { createHttpError } = "http-errors";

//CREATE
const register = async (req, res, next) => {
  //Register a new user
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // If errors exist, return a response with errors
    return next(createHttpError(400, { message: errors.array() }));
  }

  const { email, username, password } = req.body;
  console.log(email, password, username);

  try {
    const registeredUser = await userHandler.register(
      email,
      password,
      username
    ); //will return a registered user
    res.status(201).json("Successfully registered user", registeredUser);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  //Login a user
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(createHttpError(400, { message: errors.array() }));
  }

  const { email, password } = req.body;

  try {
    const { user, err } = await userHandler.login(email, password);
    req.login(user, (err) => {
      if (err) return next(err);

      res.status(200).json("Successfully logged in user");
    });
  } catch (err) {
    next(err);
  }
};

//READ

const getThisUserRuns = async (req, res, next) => {
  //FUNCTION: return an array of notes for a given run

  const userId = req.params.userId;

  try {
    const runs = await userHandler.getThisUserRuns(userId);
    res.status(200).json(runs);
  } catch (err) {
    next(err);
  }
};

const getThisUserRunIds = async (req, res, next) => {
  //FUNCTION: returns an array of runIds for a given user

  const userId = req.params.userId;

  try {
    const runIds = await userHandler.getThisUserRunIds(userId);
    res.status(200).json(runIds);
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  //FUNCTION: return one user
  const userId = req.params.userId;

  try {
    const user = await userHandler.getUser(userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

//UPDATE

//TODO: add better passport.updatepassword
const updateUser = async (req, res, next) => {
  const userId = req.user.id;
  const keyValue = req.body; // should be something like {tot_runs: 0}

  try {
    const updatedUser = await userHandler.updateUser(userId, keyValue);
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

//DELETE

const deleteUserContent = async (req, res, next) => {
  //FUNCTION: delete the runs+notes associated with a user, then set tot_runs and tot_notes to 0

  const userId = req.user.id;

  try {
    await userHandler.deleteUserContent(userId);
    res.status(204).json("Runs and notes for this user deleted");
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  //FUNCTION: delete one user

  const userId = req.params.userId;

  try {
    await userHandler.deleteUser(userId);
    res.status(204).json("User deleted");
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  login,
  getThisUserRuns,
  getThisUserRunIds,
  getUser,
  updateUser,
  deleteUserContent,
  deleteUser,
};
