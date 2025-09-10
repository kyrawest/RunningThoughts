import { Router } from "express";

// Import Routers
import runRouter from "./runRoutes.js";
import userRouter from "./userRoutes.js";
import noteRouter from "./noteRoutes.js";
import renderRouter from "./renderRoutes.js";
import mobileRouter from "./mobile/mobileRouter.js";
// import mobileAuth from "./mobileAuth.js";

export const router = Router();

router.use("/runs", runRouter);
router.use("/users", userRouter);
router.use("/notes", noteRouter);
router.use("/mobile", mobileRouter);
router.use("/", renderRouter);
