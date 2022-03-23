const UserController = require("../controllers/UserController");

const router = require("express").Router();

const userRouter = (io) => {
  const userController = new UserController(io);
  router.get("/", userController.getListUser);

  return router;
};

module.exports = userRouter;
