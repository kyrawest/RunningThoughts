export const isLoggedIn = (req, res, next) => {
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
  if (req.user._id.toString() == req.params.userId) {
    return next();
  } else {
    res
      .status(403)
      .json({ message: "You do not have permission to access this" });
  }
};
