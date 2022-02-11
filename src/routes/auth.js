const AuthController = require("../controllers/authController");

const router = require("express").Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/logout", AuthController.logout);

module.exports = router;
