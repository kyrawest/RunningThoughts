import express from "express";
import passport from "../passport.js"; // your modified passport.js
import { signAccessToken, signRefreshToken } from "../passport.js"; // helper functions

const router = express.Router();

// POST /api/mobile/login
router.post(
  "/login",
  passport.authenticate("local", { session: false }), // no session for mobile
  (req, res) => {
    const user = req.user;

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Optional: save hashed refreshToken in DB to support rotation/revocation

    res.json({
      user: { id: user._id, username: user.username },
      accessToken,
      refreshToken,
    });
  }
);

export default router;
