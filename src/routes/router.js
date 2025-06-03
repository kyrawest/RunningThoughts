import { Router } from "express";
import { catchErrors } from "../handlers/errorHandlers.js";

// Import Routers
import runRouter from "./runRoutes.js";
import userRouter from "./userRoutes.js";
import noteRouter from "./noteRoutes.js";
import renderRouter from "./renderRoutes.js";

const log = (req, res, next) => {
  console.log("here");
  next();
};

export const router = Router();

router.use("/runs", runRouter);
router.use("/users", log, userRouter);
router.use("/notes", noteRouter);
router.use("/", renderRouter);
