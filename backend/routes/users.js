const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUser, getCurrentUser, updateUser, updateUserAvatar,
} = require('../controllers/users');
const { urlRegex, hexRegex } = require('../utils/constants');

router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().pattern(hexRegex).length(24),
  }),
}), getUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(urlRegex),
  }).unknown(true),
}), updateUser);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(urlRegex),
  }).unknown(true),
}), updateUserAvatar);

module.exports = router;
