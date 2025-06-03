import mongoose from "mongoose";
import plm from "passport-local-mongoose";

//user model
const userSchema = new mongoose.Schema(
  {
    schema: { type: Number, required: true, default: 1.0 },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    current_run: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Run",
      default: null,
    },
    currentRunUpdatedAt: { type: Date, default: null },
    tot_notes: { type: Number, required: true, default: 0 },
    tot_open_notes: { type: Number, required: true, default: 0 },
    tot_runs: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

userSchema.plugin(plm, {
  usernameField: "email",
  usernameUnique: true,
  errorMessages: {
    MissingPasswordError: "Password is required",
    IncorrectPasswordError: "Incorrect password",
    IncorrectUsernameError: "Incorrect email",
    UserExistsError: "Email already exists",
  },
});

export default mongoose.model("User", userSchema);
