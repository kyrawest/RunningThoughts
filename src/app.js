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
import helmet from "helmet";

// Create expresss app
export const app = express();

//Setting up helemt
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://kit.fontawesome.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://ka-f.fontawesome.com",
      ],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      connectSrc: ["'self'", "https://ka-f.fontawesome.com"],
      upgradeInsecureRequests: [],
    },
  })
);

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

const allowedOrigins = [
  "http://localhost:3000", // local dev
  "https://runningthoughts.onrender.com", // your deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
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

app.use(notFound);

app.use(errorHandler);
