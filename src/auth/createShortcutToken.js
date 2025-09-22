// utils/createShortcutToken.js
import jwt from "jsonwebtoken";
import ShortcutToken from "../models/shortcutToken.js";

export async function createShortcutToken(userId) {
  const payload = {
    sub: userId,
    scope: "create:note",
    type: "shortcut", // mark as Shortcut token
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d", // optional long-lived
  });

  await ShortcutToken.create({
    userId,
    token,
    scope: payload.scope,
  });

  return token;
}
