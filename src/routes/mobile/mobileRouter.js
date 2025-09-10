import { Router } from "express";

import userRouter from "./userRoutes.js";
import runRouter from "./runRoutes.js";
import noteRouter from "./noteRoutes.js";

const mobileRouter = Router();

// Prefix each module router for clarity in the mobile API
mobileRouter.use("/users", userRouter); // all user-related endpoints
mobileRouter.use("/runs", runRouter); // all run-related endpoints
mobileRouter.use("/notes", noteRouter); // all note-related endpoints

export default mobileRouter;
