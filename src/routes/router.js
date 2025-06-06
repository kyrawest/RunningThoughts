import { Router } from "express";
import { catchErrors } from "../handlers/errorHandlers.js";

// Import Routers
import runRouter from "./runRoutes.js";
import userRouter from "./userRoutes.js";
import noteRouter from "./noteRoutes.js";
import renderRouter from "./renderRoutes.js";

const log1 = (req, res, next) => {
  console.log("here in /runs");
  next();
};
const log2 = (req, res, next) => {
  console.log("here in /users");
  next();
};
const log3 = (req, res, next) => {
  console.log("here in /notes");
  next();
};
const log4 = (req, res, next) => {
  console.log("here in /");
  next();
};

const sessionLog = (req, res, next) => {
  console.log("session at / route:", req.session);
  next();
};

export const router = Router();

router.use("/runs", runRouter);
router.use("/users", userRouter);
router.use("/notes", noteRouter);
router.get("/test-flash", (req, res) => {
  req.flash("error", "Flash works!");
  res.redirect("/dashboard");
});
router.use("/", renderRouter);
