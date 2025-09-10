import userHandler from "../handlers/userHandler.js";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

//CREATE

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new createHttpError(400, "Passwords do not match.", { expose: true });
  }

  try {
    const user = await userHandler.register(email, password, username);
    res.status(201).json({ message: "Account created successfully.", user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const { user, token } = await userHandler.mobileLogin(email, password);
    // `userHandler.login` should return a JWT for mobile
    res.status(200).json({ message: "Logged in successfully.", user, token });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  // For JWT, "logout" is handled client-side by deleting the token
  res.status(200).json({ message: "Logged out successfully." });
};

//READ

const getThisUserRuns = async (req, res, next) => {
  try {
    const pageNumber = req.query.page ? parseInt(req.query.page) : 1;
    const userId = req.params.userId;
    const runs = await userHandler.getThisUserRuns(userId, pageNumber);
    res.status(200).json(runs);
  } catch (err) {
    next(err);
  }
};

const getThisUserRunIds = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const runIds = await userHandler.getThisUserRunIds(userId);
    res.status(200).json(runIds);
  } catch (err) {
    next(err);
  }
};

//UPDATE

const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new createHttpError(400, "Missing fields for password update.", {
      expose: true,
    });
  }

  if (newPassword !== confirmPassword) {
    throw new createHttpError(400, "New passwords do not match.", {
      expose: true,
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await userHandler.updatePassword(
      userId,
      currentPassword,
      newPassword,
      confirmPassword
    );
    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
};

const updateEmail = async (req, res, next) => {
  const { email } = req.body;
  const userId = req.user._id;

  if (!email) {
    throw new createHttpError(400, "Missing email.", { expose: true });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await userHandler.updateUser(userId, { email });
    res.status(200).json({ message: "Email updated successfully." });
  } catch (err) {
    next(err);
  }
};

const updateUsername = async (req, res, next) => {
  const { username } = req.body;
  const userId = req.user._id;

  if (!username) {
    throw new createHttpError(400, "Missing username.", { expose: true });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await userHandler.updateUser(userId, { username });
    res.status(200).json({ message: "Username updated successfully." });
  } catch (err) {
    next(err);
  }
};

//DELETE

const deleteUserContent = async (req, res, next) => {
  const userId = req.user._id;

  try {
    await userHandler.deleteUserContent(userId);
    res.status(200).json({ message: "User content deleted successfully." });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    await userHandler.deleteUser(userId);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  login,
  logout,
  getThisUserRuns,
  getThisUserRunIds,
  updateEmail,
  updateUsername,
  updatePassword,
  deleteUserContent,
  deleteUser,
};
