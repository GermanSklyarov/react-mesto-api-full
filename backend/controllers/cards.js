const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch(next);
};
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((card) => {
      res.send(card);
    })
    .catch(next);
};
module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        const error = new NotFoundError('Not found');
        throw error;
      }
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Удалять можно только свою карточку');
      }
      return card;
    })
    .then((card) => {
      card.remove();
      return card;
    })
    .then((card) => {
      res.send(card);
    })
    .catch(next);
};
module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        const error = new NotFoundError('Not found');
        throw error;
      }
      res.send(card);
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        const error = new NotFoundError('Not found');
        throw error;
      }
      res.send(card);
    })
    .catch(next);
};
