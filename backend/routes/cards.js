const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  createCard, getCards, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');
const { urlRegex, hexRegex } = require('../utils/constants');

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(urlRegex),
  }).unknown(true),
}), createCard);
router.get('/', getCards);
router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().pattern(hexRegex).length(24),
  }),
}), deleteCard);
router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().pattern(hexRegex).length(24),
  }),
}), likeCard);
router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().pattern(hexRegex).length(24),
  }),
}), dislikeCard);

module.exports = router;
