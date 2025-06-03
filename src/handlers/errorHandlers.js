export const catchErrors = (fn) => {
  return function (req, res, next) {
    try {
      // If fn is async, it will return a Promise, so we attach .catch()
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
      // If fn is synchronous and throws an error, catch it here
      console.log("error:", err);
      next(err);
    }
  };
};

export const notFound = (req, res, next) => {
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

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  console.error("Error:", status, err.message);

  // Allow multiple error messages
  if (req.flash) {
    if (Array.isArray(err.message)) {
      err.message.forEach((msg) => req.flash("error", msg));
    } else {
      req.flash(
        "error",
        err.message || "Sorry, we got tripped up. Something went wrong."
      );
    }
  }
  // Redirect to a safe fallback
  if (!res.headersSent) {
    const referer = req.get("Referer");
    let redirectPath = "/"; // default fallback

    if (referer) {
      const url = new URL(referer);
      // Get only the path and query string (e.g., /some/page?x=1)
      redirectPath = url.pathname + url.search;
    }

    res.redirect(redirectPath);
  }
};
