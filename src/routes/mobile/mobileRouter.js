import { Router } from "express";

import userRouter from "./userRoutes.js";
import runRouter from "./runRoutes.js";
import noteRouter from "./noteRoutes.js";
import shortcutRouter from "./shortcutRouter.js";
import passport from "../../handlers/passport.js";

import renderController from "../../controllers/mobile/renderController.js";

import { isLoggedIn, verifyJWT } from "../../auth/auth.js";
import { catchErrors } from "../../handlers/errorHandlers.js";
import createHttpError from "http-errors";

const mobileRouter = Router();

// Prefix each module router for clarity in the mobile API
mobileRouter.use("/users", userRouter); // all user-related endpoints
mobileRouter.use("/runs", runRouter); // all run-related endpoints
mobileRouter.use(
  "/notes",
  (req, res, next) => {
    console.log(`📝 Notes router reached: ${req.method} ${req.path}`);
    next();
  },
  noteRouter
); // all note-related endpoints
mobileRouter.use(
  "/dashboard",
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        // Force it through your error handler as JSON
        return next(createHttpError(401, "Unauthorized", { expose: true }));
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  catchErrors(renderController.dashboard)
); // Mobile dashboard rendering endpoint
mobileRouter.post("/shortcut/", shortcutRouter);

export default mobileRouter;
