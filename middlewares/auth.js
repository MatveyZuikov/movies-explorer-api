const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require("jsonwebtoken");
const AuthError = require("../errors/AuthError");

const auth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(new AuthError("Необходима авторизация"));
  }

  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
      // "dev-secret",
    );
  } catch (err) {
    return next(new AuthError("Необходима авторизация"));
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};

module.exports = auth;
