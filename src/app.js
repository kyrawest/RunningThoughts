import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import passport from "passport";
import utils from "./utils/utils.js";
import { router } from "./routes/router.js";
import { notFound } from "./handlers/errorHandlers.js";
import "./handlers/passport.js";
import cors from "cors";

// Create expresss app
export const app = express();

// View engine setup
app.set("view engine", "ejs");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:3000", // or "*" for Postman
    credentials: true, // ❗ this is required to send cookies
  })
);

// Session middleware
app.use(
  session({
    secret: process.env.PASSPORT_SECRET,
    key: process.env.PASSPORT_COOKIE,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.URI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Set locals
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.u = utils;
  res.locals.path = req.path;
  next();
});

app.use("/", router);
app.use("/", (err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

// app.use(notFound);
