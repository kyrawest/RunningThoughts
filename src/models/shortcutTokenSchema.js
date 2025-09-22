import mongoose from "mongoose";

const ShortcutTokenSchema = new mongoose.Schema({
  schema: { type: Number, required: true, default: 1.0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  scope: { type: String, default: "create:note" },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ShortcutToken", ShortcutTokenSchema);
