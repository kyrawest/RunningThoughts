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
import { notFound, errorHandler } from "./handlers/errorHandlers.js";
import "./handlers/passport.js";
import cors from "cors";
import methodOverride from "method-override";
import flash from "connect-flash";
import favicon from "serve-favicon";

// Create expresss app
export const app = express();

// View engine setup
app.set("view engine", "ejs");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// Bootstrap
app.use(
  "/css",
  express.static(path.join(__dirname, "../node_modules/bootswatch/dist/brite"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "../node_modules/bootstrap/dist/js"))
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in the POST body and override method
      return req.body._method;
    }
  })
);
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

app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});

// Set locals
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.u = utils;
  res.locals.path = req.path;
  next();
});

app.use("/", router);
// app.use("/", (err, req, res, next) => {
//   console.error("Error:", err);
//   if (err.status === 404) {
//     return res.status(404).json({ message: "404 Not Found" });
//   } else if (err.name === "CastError") {
//     return res.status(400).json({ message: "Invalid ID format" });
//   } else if (err.message === "User login failed") {
//     return res.status(401).json({ message: "User login failed" });
//   } else {
//     res
//       .status(err.status || 500)
//       .json({ message: err.message || "Internal Server Error" });
//   }
// });

app.use(notFound);

app.use(errorHandler);
