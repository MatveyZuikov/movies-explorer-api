const MovieModel = require('../models/movie');

const ValidationError = require('../errors/ValidationError');
const AuthForbiddenError = require('../errors/AuthForbiddenError');
const NotFoundError = require('../errors/NotFoundError');
const CastError = require('../errors/CastError');

const getMovies = (req, res, next) => {
  const ownerId = req.user._id;

  MovieModel.find({ owner: ownerId })
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const ownerId = req.user._id;

  return MovieModel.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner: ownerId,
    movieId,
    nameRU,
    nameEN,
  })
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Некорректные данные'));
      }
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  const { id } = req.params;
  const deleteThisCard = () => {
    MovieModel.findByIdAndRemove(id)
      .then(() => res.send({ message: 'Фильм удален' }))
      .catch(next);
  };

  MovieModel.findById(id)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм не найден');
      }

      if (movie.owner.toString() !== req.user._id) {
        throw new AuthForbiddenError(
          'Нельзя удалить фильм другого пользователя',
        );
      }

      return deleteThisCard();
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new CastError('Переданы некорректные данные'));
      }
      return next(err);
    });
};

module.exports = {
  getMovies,
  deleteMovie,
  createMovie,
};
