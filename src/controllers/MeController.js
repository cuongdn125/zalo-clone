const User = require("../models/User");
const createError = require("http-errors");
const { parseCookies } = require("../utils/cookie");
const { uploadImage } = require("../utils/uploadFile");

class MeController {
  async getProfile(req, res, next) {
    try {
      //   console.log(req.userId);
      const user = await User.findById(req.userId);
      if (!user) {
        return next(createError(500, "User not found"));
      }
      res.json({
        success: true,
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          gender: user.gender,
          avatar: user.avatar,
          dateOfBirth: user.dateOfBirth,
        },
      });
    } catch (err) {
      return next(createError(500, err.message));
    }
  }
  async updateProfile(req, res, next) {
    try {
      const user = req.body;
      if (!user) {
        return next(createError(500, "User not found"));
      }
      if (req.userId !== user._id) {
        return next(createError(500, "User not found"));
      }
      if (user.avatar) {
        const avatar = await uploadImage(user.avatar);
        user.avatar = avatar;
      }
      const updatedUser = await User.findByIdAndUpdate(user._id, user, {
        new: true,
      });
      // console.log(updatedUser);
      res.json({
        success: true,
        user: {
          id: updatedUser._id,
          userName: updatedUser.userName,
          email: updatedUser.email,
          dateOfBirth: updatedUser.dateOfBirth,
          avatar: updatedUser.avatar,
          gender: updatedUser.gender,
        },
      });
    } catch (err) {
      return next(createError(500, err.message));
    }
  }
}

module.exports = new MeController();
