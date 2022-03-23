const MeController = require("../controllers/MeController");
const auth = require("../middleware/auth");
const authRouter = require("./auth");

const memberRouter = require("./member");

const route = (app, io) => {
  const friendRouter = require("./friend")(io);
  const conversationRouter = require("./conversation")(io);
  const messageRouter = require("./message")(io);

  const userRouter = require("./user")(io);

  app.use("/auth", authRouter);
  app.use(auth);

  app.get("/me", MeController.getProfile);
  app.patch("/me", MeController.updateProfile);

  app.use("/friend", friendRouter);
  app.use("/member", memberRouter);
  app.use("/user", userRouter);
  app.use("/conversation", conversationRouter);
  app.use("/message", messageRouter);
};
module.exports = route;
