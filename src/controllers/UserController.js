const ObjectId = require("mongoose").Types.ObjectId;
const UserService = require("../services/userService");

class UserController {
  constructor(io) {
    this.io = io;
  }
  async getListUser(req, res, next) {
    const { userId } = req;
    try {
      const users = await UserService.getListUser(userId);
      res.json({
        success: true,
        data: users,
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = UserController;
