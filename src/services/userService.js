const User = require("../models/User");
const mongoose = require("mongoose");
const Friend = require("../models/Friend");
const FriendRequest = require("../models/FriendRequest");
const ObjectId = mongoose.Types.ObjectId;

class UserService {
  async getListUser(userId) {
    const users = await User.aggregate([
      {
        $match: {
          _id: {
            $ne: ObjectId(userId),
          },
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);
    // console.log(users);
    let result = [];
    for (const user of users) {
      // console.log(user.userName);
      const isSenderRequest = await FriendRequest.isSenderRequest(
        userId,
        user._id
      );
      if (isSenderRequest) {
        result.push({
          ...user,
          isSenderRequest: isSenderRequest,
        });
        continue;
      }
      const isFriend = await Friend.isFriend(userId, user._id);
      if (isFriend) {
        result.push({
          ...user,
          isFriend: isFriend,
        });
        continue;
      }
      const isReceiverRequest = await FriendRequest.isReceiverRequest(
        userId,
        user._id
      );

      if (isReceiverRequest) {
        result.push({
          ...user,
          isReceiverRequest: isReceiverRequest,
        });
        continue;
      }
      result.push(user);
    }
    return result;
  }
}

module.exports = new UserService();
