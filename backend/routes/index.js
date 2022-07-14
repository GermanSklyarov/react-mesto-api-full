const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userRouter = require('./users');
const cardRouter = require('./cards');
const { login, createUser, logout } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { urlRegex } = require('../utils/constants');
const NotFoundError = require('../errors/not-found-err');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }).unknown(true),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(urlRegex),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }).unknown(true),
}), createUser);
router.get('/logout', logout);
router.use(auth);
router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use('/', (req, res, next) => {
  const err = new NotFoundError('Not found');
  next(err);
});

module.exports = router;
