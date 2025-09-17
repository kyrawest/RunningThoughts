import createHttpError from "http-errors";
import passport from "../handlers/passport.js";

export const isLoggedIn = (req, res, next) => {
  // Middleware to check if the user is logged in
  // If the user is authenticated, proceed to the next middleware or route handler
  // If not authenticated, redirect to login page with flash messages
  if (req.isAuthenticated()) {
    return next();
  }
  if (res.locals.flashMessages.error && res.locals.flashMessages.error.length) {
    if (res.locals.flashMessages.error.length > 1) {
      res.locals.flashMessages.error.forEach((msg) => req.flash("error", msg));
    } else {
      req.flash(
        "error",
        res.locals.flashMessages.error ||
          "Sorry, we got tripped up. Something went wrong."
      );
    }
  }

  if (
    res.locals.flashMessages.success &&
    res.locals.flashMessages.success.length
  ) {
    if (res.locals.flashMessages.success.length > 1) {
      res.locals.flashMessages.success.forEach((msg) =>
        req.flash("success", msg)
      );
    } else {
      req.flash(
        "success",
        res.locals.flashMessages.success ||
          "Everything is going according to plan."
      );
    }
  }
  res.redirect("/login");
};

export const isAuthorized = (req, res, next) => {
  //For routes that have userId in params, check if it matches req.user._id. If not, throw 403 error.
  if (req.user._id.toString() == req.params.userId) {
    return next();
  } else {
    throw new createHttpError(
      403,
      "You do not have permission to access this",
      { expose: true }
    );
  }
};

//For mobile auth with passport:
export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id, email: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export const verifyJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // Force it through your error handler as JSON
      return next(createHttpError(401, "Unauthorized", { expose: true }));
    }
    req.user = user;
    next();
  });
  // console.log("Verifying JWT...", req.headers);
  // const authHeader = req.headers["authorization"];

  // if (!authHeader) {
  //   return res.status(401).json({ message: "Missing Authorization header" });
  // }

  // const token = authHeader.split(" ")[1]; // Expect "Bearer <token>"

  // if (!token) {
  //   return res.status(401).json({ message: "Missing token" });
  // }

  // try {
  //   const payload = jwt.verify(token, process.env.JWT_SECRET);
  //   req.user = {
  //     _id: payload.sub,
  //     email: payload.email,
  //     username: payload.username,
  //   };
  //   next();
  // } catch (err) {
  //   return res.status(401).json({ message: "Invalid or expired token" });
  // }
};
