const { checkError } = require('../utils/functions');

module.exports = (err, req, res, next) => {
  const { statusCode = checkError(err), message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
};
