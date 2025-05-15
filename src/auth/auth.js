export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res
    .status(401)
    .json({ message: "You must be logged in to access this resource" });
};

export const isAuthorized = (req, res, next) => {
  if (req.user._id.toString() == req.params.userId) {
    return next();
  }

  res
    .status(403)
    .json({ message: "You do not have permission to access this" });
};
