const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const ValidationError = require('../errors/ValidationError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');

const saltRounds = 10;
let secureValue;
if (NODE_ENV === 'production') {
  secureValue = true;
} else {
  secureValue = false;
}

const createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, saltRounds)
    .then((hash) => {
      UserModel.create({ name, email, password: hash })
        .then(
          res.status(201).send({ name, email }),
        )
        .catch((err) => {
          if (err.code === 11000) {
            return next(
              new ConflictError('Пользователь с таким email уже существует'),
            );
          }
          if (err.name === 'ValidationError') {
            return next(new ValidationError('Некорректные данные'));
          }
          return next(err);
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return UserModel.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        {
          expiresIn: '7d',
        },
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000,
          httpOnly: true,
          sameSite: 'none',
          secure: secureValue,
        })
        .send({ message: 'Вы успешно авторизовались' });
    })
    .catch(next);
};

const logout = (req, res) => {
  res
    .clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: secureValue,
    })
    .send({ message: 'Вы успешно вышли' });
};

const getMyInfo = (req, res, next) => {
  const owner = req.user._id;

  UserModel.findById(owner)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Переданы некорректные данные');
      }
      res.status(200).send({ name: user.name, email: user.email });
    })
    .catch(next);
};

const updateUserById = (req, res, next) => {
  const owner = req.user._id;
  const userData = req.body;

  UserModel.findByIdAndUpdate(owner, userData, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден.'));
      }
      return res.send({ name: user.name, email: user.email });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(
          new ConflictError('Пользователь с таким email уже существует'),
        );
      }
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Некорректные данные'));
      }
      return next(err);
    });
};

module.exports = {
  createUser,
  getMyInfo,
  updateUserById,
  login,
  logout,
};
