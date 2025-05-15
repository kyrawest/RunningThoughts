import User from "../models/userSchema.js";
import Run from "../models/runSchema.js";
import Note from "../models/noteSchema.js";

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
      throw new Error("Password is required.");
    }
    if (err.name === "UserExistsError") {
      throw new Error("Email already exists.");
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
  const authentication = await User.authenticate()(email, password);
  if (!authentication.user || authentication.error) {
    throw new Error("User login failed");
  }
  return authentication;
};

//READ

const getThisUserRuns = async (userId) => {
  //FUNCTION: returns all the runs associated with a given user
  return await Run.find({ userId }).lean();
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

  const updatedUser = await User.updateOne({ _id: userId }, { $set: keyValue });
  return updatedUser;
};

//DELETE

const deleteUserContent = async (userId) => {
  //FUNCTION: deletes all runs and notes associated with a user, sets tot_runs and tot_notes for a user to zero

  await Note.deleteMany({ userId });
  await Run.deleteMany({ userId });

  await User.updateOne(
    { _id: userId },
    { $set: { tot_notes: 0, tot_runs: 0 } }
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
  deleteUserContent,
  deleteUser,
};
