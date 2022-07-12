const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const AuthorizationError = require('../errors/authorization-err');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    const err = new AuthorizationError('Необходима авторизация');
    next(err);
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    err.statusCode = 401;
    err.message = 'Необходима авторизация';
    next(err);
  }

  req.user = payload;

  return next();
};
