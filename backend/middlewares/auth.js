const jwt = require('jsonwebtoken');
const AuthorizationError = require('../errors/authorization-err');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    const err = new AuthorizationError('Необходима авторизация');
    next(err);
  }

  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    err.statusCode = 401;
    err.message = 'Необходима авторизация';
    next(err);
  }

  req.user = payload;

  return next();
};
