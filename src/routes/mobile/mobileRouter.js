import { Router } from "express";

import userRouter from "./userRoutes.js";
import runRouter from "./runRoutes.js";
import noteRouter from "./noteRoutes.js";

import renderController from "../../controllers/mobile/renderController.js";

import { isLoggedIn } from "../../auth/auth.js";
import { catchErrors } from "../../handlers/errorHandlers.js";

const mobileRouter = Router();

// Prefix each module router for clarity in the mobile API
mobileRouter.use("/users", userRouter); // all user-related endpoints
mobileRouter.use("/runs", runRouter); // all run-related endpoints
mobileRouter.use("/notes", noteRouter); // all note-related endpoints
mobileRouter.use(
  "/dashboard",
  isLoggedIn,
  catchErrors(renderController.dashboard)
); // Mobile dashboard rendering endpoint

export default mobileRouter;
