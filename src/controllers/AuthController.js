const User = require("../models/User");
const { parseCookies } = require("../utils/cookie");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} = require("../utils/token");

const createError = require("http-errors");
const { registerSchema, loginSchema } = require("../validate/auth");
const redis = require("../config/redis");

class AuthController {
  constructor() {}
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await loginSchema.validateAsync({
        email,
        password,
      });

      const result = await User.findByCendentials(user.email, user.password);

      if (!result) {
        return next(createError(500, "User not found"));
      }

      const accessToken = await generateAccessToken({ id: result._id })
        .then((token) => {
          return token;
        })
        .catch((err) => {
          return next(err);
        });
      const refreshToken = await generateRefreshToken({ id: result._id })
        .then((token) => {
          return token;
        })
        .catch((err) => {
          return next(err);
        });
      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60,
          // secure: true,
          // sameSite: "strict",
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 7,
          // secure: true,
          // sameSite: "strict",
          path: "auth/refresh-token",
        })
        .json({
          message: "User logged in successfully",
        });
    } catch (err) {
      console.log(err.message);
      return next(err);
    }
  }
  async register(req, res, next) {
    try {
      const { userName, email, password } = req.body;
      const user = await registerSchema.validateAsync({
        userName,
        email,
        password,
      });

      const doesExist = await User.findOne({ email: user.email });
      if (doesExist) {
        return next(createError(500, "User already exists"));
      }
      const newUser = await User.create({
        userName: user.userName,
        email: user.email,
        password: user.password,
      });
      res.json({
        message: "User created successfully",
        user: newUser,
      });
    } catch (err) {
      return next(createError(500, err.message));
    }
  }
  async refreshToken(req, res, next) {
    try {
      const token = req.headers.cookie;
      console.log("token: ", token);
      const refreshToken = parseCookies(token).refreshToken;
      if (!refreshToken) {
        res
          .cookie("refreshToken", "", {
            httpOnly: true,
            maxAge: 0,
            // secure: true,
            sameSite: "strict",
            path: "auth/refresh-token",
          })
          .cookie("accessToken", "", {
            httpOnly: true,
            maxAge: 0,
            // secure: true,
            // sameSite: "strict",
          });
        return next(createError(403, "Unauthorized"));
      }
      const decoded = await verifyRefreshToken(refreshToken);
      const accessToken = await generateAccessToken({ id: decoded.id });
      // console.log(accessToken, decoded);
      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60,
          // secure: true,
          // sameSite: "strict",
        })
        .json({
          message: "Token refreshed successfully",
        });
    } catch (err) {
      res
        .cookie("refreshToken", "", {
          httpOnly: true,
          maxAge: 0,
          // secure: true,
          // sameSite: "strict",
          path: "auth/refresh-token",
        })
        .cookie("accessToken", "", {
          httpOnly: true,
          maxAge: 0,
          // secure: true,
          // sameSite: "strict",
        });
      return next(err);
    }
  }
  async logout(req, res, next) {
    try {
      const token = req.headers.cookie;
      const accessToken = parseCookies(token).accessToken;
      if (!accessToken) {
        return next(createError(401, "Unauthorized"));
      }
      const decoded = await verifyAccessToken(accessToken);
      redis.del(decoded.id, (err, reply) => {
        if (err) {
          throw createError.InternalServerError();
        }
        return res
          .cookie("refreshToken", "", {
            httpOnly: true,
            maxAge: 0,
            // secure: true,
            // sameSite: "strict",
            path: "auth/refresh-token",
          })
          .cookie("accessToken", "", {
            httpOnly: true,
            maxAge: 0,
            // secure: true,
            // sameSite: "strict",
          })
          .json({
            message: "User logged out successfully",
          });
      });
    } catch (err) {
      return next(err);
    }
  }
  async forgotPassword(req, res, next) {}
}

module.exports = new AuthController();
