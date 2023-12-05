const router = require("express").Router();
const LinkPattern = require("../utils/avatarPattern");
const { celebrate, Joi } = require("celebrate");

const { updateUserById, getMyInfo } = require("../controllers/users");

router.get("/users/me", getMyInfo);
router.patch(
  "/users/me",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().required().email(),
    }),
  }),
  updateUserById
);

module.exports = router;
