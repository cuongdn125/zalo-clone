const MeController = require("../controllers/MeController");
const auth = require("../middleware/auth");
const authRouter = require("./auth");

const route = (app, io) => {
  app.use("/auth", authRouter);
  app.use(auth);
  app.get("/me", MeController.getProfile);
  app.patch("/me", MeController.updateProfile);
};
module.exports = route;
