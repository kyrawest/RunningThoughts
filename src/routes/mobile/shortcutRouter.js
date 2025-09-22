import { Router } from "express";

import passport from "../../handlers/passport.js";
import runController from "../../controllers/mobile/runController.js";

import { isLoggedIn, verifyJWT } from "../../auth/auth.js";
import { catchErrors } from "../../handlers/errorHandlers.js";
import createHttpError from "http-errors";

const shortcutRouter = Router();

// Prefix each module router for clarity in the mobile API

shortcutRouter.post(
  "/notes",
  passport.authenticate("shortcut-jwt", { session: false }),
  catchErrors(runController.addNoteToCurrentRun)
);

// Revoke a token
shortcutRouter.post("/revoke", async (req, res) => {
  const { token, userId } = req.body; // ensure userId matches current user in your auth
  await ShortcutToken.findOneAndUpdate({ token, userId }, { revoked: true });
  res.json({ success: true });
});

// List active tokens
shortcutRouter.get("/", verifyJWT, async (req, res) => {
  const { userId } = req.query;
  const tokens = await ShortcutToken.find({ userId, revoked: false });
  res.json(tokens);
});

export default shortcutRouter;
