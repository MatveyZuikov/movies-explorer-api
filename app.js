require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const handleError = require('./middlewares/handleError');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const router = require('./routes/index');
const limiter = require('./middlewares/rateLimiter');

const { PORT = 3000, MONGO_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
  });

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3005',
      'http://localhost:3000',
      'https://movies.n1ght.nomoredomainsmonster.ru',
      'http://movies.n1ght.nomoredomainsmonster.ru',
      'https://api.movies.n1ght.nomoredomainsmonster.ru',
      'http://api.movies.n1ght.nomoredomainsmonster.ru',
    ],
    credentials: true,
  }),
);
app.use(helmet());

app.use(cookieParser());

app.use(express.json());

app.use(requestLogger);
app.use(limiter);

app.use('/', router);

app.use(errorLogger);
app.use(errors());
app.use(handleError);

app.listen(PORT);
