import { Router } from "express";
import { catchErrors } from "../handlers/errorHandlers.js";

// Import Routers
import runRouter from "./runRoutes.js";
import userRouter from "./userRoutes.js";
import noteRouter from "./noteRoutes.js";

export const router = Router();

router.use("/run", runRouter);
router.use("/user", userRouter);
router.use("/note", noteRouter);
