module.exports.checkError = (err) => {
  const validationErrorCode = 400;
  const notFoundErrorCode = 404;
  const defaultErrorCode = 500;
  if (err.code === 11000) {
    return 409;
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return validationErrorCode;
  }
  if (err.name === 'NotFoundError') {
    return notFoundErrorCode;
  }
  return defaultErrorCode;
};
