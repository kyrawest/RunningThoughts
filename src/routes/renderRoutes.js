import { Router } from "express";
import { catchErrors } from "../handlers/errorHandlers.js";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateUserId,
} from "../validators/userValidator.js";
import { isLoggedIn, isAuthorized } from "../auth/auth.js";

import renderController from "../controllers/renderController.js";

const renderRouter = Router();

//READ

const log3 = (req, res, next) => {
  console.log("here / in render");
  next();
};

const log5 = (req, res, next) => {
  console.log("here /dashboard");
  next();
};

renderRouter.get("/login", catchErrors(renderController.login));

renderRouter.get("/register", catchErrors(renderController.register));

const sessionLog = (req, res, next) => {
  console.log("session at /dashboard route:", req.session);
  next();
};

renderRouter.get(
  "/dashboard",
  isLoggedIn,
  (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  },
  catchErrors(renderController.dashboard)
);

renderRouter.get(
  "/run/:runId/new-note",
  isLoggedIn,
  catchErrors(renderController.newNotePage)
);

renderRouter.get(
  "/run/:runId",
  isLoggedIn,
  catchErrors(renderController.runPage)
);

renderRouter.get(
  "/note/edit/:noteId",
  isLoggedIn,
  catchErrors(renderController.editNotePage)
);

renderRouter.get(
  "/account-settings",
  isLoggedIn,
  catchErrors(renderController.accountSettings)
);

const hello = (req, res) => {
  console.log("hello");
};

renderRouter.get("/", isLoggedIn, catchErrors(renderController.dashboard));

export default renderRouter;
