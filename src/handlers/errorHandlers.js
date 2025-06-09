export const catchErrors = (fn) => {
  //Wrap around controller functions in routers. Will catch errors and pass them on.
  return function (req, res, next) {
    try {
      // If fn is async, it will return a Promise, so we attach .catch()
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
      // If fn is synchronous and throws an error, catch it here
      next(err);
    }
  };
};

export const notFound = (req, res, next) => {
  //Eliminate this from logs when the request is for the Chrome DevTools JSON file.
  if (req.path === "/.well-known/appspecific/com.chrome.devtools.json") {
    return res.status(204).end(); // Respond with No Content
  }

  console.log(`404 Error: ${req.method} ${req.url}`);
  const err = new Error(
    "Looks like we took a wrong turn, we can't find what you're looking for."
  );
  err.status = 404;
  next(err);
};

//todo: if it's a 403 error, redirect to dashboard.
export const errorHandler = (err, req, res, next) => {
  //Handler errors here. We expect errors to be thrown with createHttpError, which will have a status code and message.

  const status = err.status || 500;
  console.error("Error:", status, err.message);

  if (!req.session) {
    console.error(
      "Error: req.session is undefined. express-session middleware is not configured correctly."
    );
    return res
      .status(500)
      .send("Something went wrong. Please try again later.");
  }

  // Allow multiple error messages

  if (Array.isArray(err.message)) {
    err.message.forEach((msg) => req.flash("error", msg));
  } else {
    req.flash(
      "error",
      err.message || "Sorry, we got tripped up. Something went wrong."
    );
  }

  // Redirect to a safe fallback
  //Save the session to preserve flash messages in case something goes wrong during redirect
  req.session.save((saveErr) => {
    if (saveErr) {
      console.error("Error saving session before redirect:", saveErr);
      // Fallback if session can't be saved, but still try to redirect
    }

    const referer = req.get("Referer");
    let redirectPath = "/"; // default fallback

    if (referer) {
      const url = new URL(referer);
      redirectPath = url.pathname + url.search;
    }

    res.redirect(redirectPath);
  });
};
