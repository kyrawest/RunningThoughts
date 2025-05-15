export const catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

export const notFound = (req, rest, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
};
