import { Router } from "express";
import { catchErrors } from "../handlers/errorHandlers.js";
import { validateRunId } from "../validators/validators.js";
import { isLoggedIn } from "../auth/auth.js";

import renderController from "../controllers/renderController.js";

const renderRouter = Router();

//READ

renderRouter.get("/login", catchErrors(renderController.login));

renderRouter.get("/register", catchErrors(renderController.register));

renderRouter.get(
  "/dashboard",
  isLoggedIn,
  catchErrors(renderController.dashboard)
);

renderRouter.get(
  "/run/:runId",
  isLoggedIn,
  validateRunId,
  catchErrors(renderController.runPage)
);

renderRouter.get(
  "/account-settings",
  isLoggedIn,
  catchErrors(renderController.accountSettings)
);

// Baseline behaviour is to return to dashboard. If the user is not logged in, isLoggedIn will redirect to login page.
renderRouter.get("/", isLoggedIn, catchErrors(renderController.dashboard));

export default renderRouter;
