const router = require('express').Router();

const usersRouter = require('./users');
const moviesRouter = require('./movies');
const authRouter = require('./auth');
const { logout } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFoundError');

router.use(authRouter);

router.use(auth);

router.use(usersRouter);
router.use(moviesRouter);

router.post('/signout', logout);

router.all('*', (req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

module.exports = router;
