import { Router } from "express";

import passport from "../../handlers/passport.js";
import runController from "../../controllers/mobile/runController.js";

import { isLoggedIn, verifyJWT } from "../../auth/auth.js";
import { catchErrors } from "../../handlers/errorHandlers.js";
import createHttpError from "http-errors";

const shortcutRouter = Router();

// Prefix each module router for clarity in the mobile API

import ShortcutToken from "../../models/shortcutTokenSchema.js";
import jwt from "jsonwebtoken";

// Generate a new Shortcut token
shortcutRouter.post("/generate", verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id; // populated by verifyJWT

    // Create JWT payload for Shortcut token
    const payload = {
      sub: userId,
      scope: "create:note",
      type: "shortcut", // distinguish from normal login JWT
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    // Save in DB for revocation
    await ShortcutToken.create({
      userId,
      token,
      scope: payload.scope,
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate shortcut token" });
  }
});

shortcutRouter.post(
  "/notes",
  passport.authenticate("shortcut-jwt", { session: false }),
  catchErrors(runController.addNoteToCurrentRun)
);

// Revoke a token
shortcutRouter.post("/revoke", verifyJWT, async (req, res) => {
  const userId = req.user._id;
  const { token } = req.body;
  await ShortcutToken.findOneAndUpdate({ token, userId }, { revoked: true });
  res.json({ success: true });
});

// List active tokens
shortcutRouter.get("/", verifyJWT, async (req, res) => {
  const userId = req.user._id;
  const tokens = await ShortcutToken.find({ userId, revoked: false });
  res.json(tokens);
});

export default shortcutRouter;
