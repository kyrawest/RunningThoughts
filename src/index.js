import dotenv from "dotenv";
dotenv.config();
import { connect } from "./connect.js";

// Import models
import "./models/userSchema.js";
import "./models/runSchema.js";
import "./models/noteSchema.js";

// Connect to MongoDB
try {
  await connect(process.env.URI);
  console.log("Connected to MongoDB");

  const { app } = await import("./app.js");
  console.log("App loaded");

  // Start app
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
} catch (err) {
  console.error("Error connecting to MongoDB", err);
}
