import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    schema: { type: Number, required: true, default: 1.0 },
    content: { type: String, required: true },
    open: { type: Boolean, default: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    runId: { type: mongoose.Schema.Types.ObjectId, ref: "Run", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
