import mongoose from "mongoose";

export const runSchema = new mongoose.Schema(
  {
    schema: { type: Number, required: true, default: 1.0 },
    title: { type: String, maxlength: 200, trim: true },
    tot_notes: { type: Number, required: true, default: 0 },
    tot_open_notes: { type: Number, required: true, default: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Run", runSchema);
