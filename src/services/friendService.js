const Friend = require("../models/Friend");
const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const ObjectId = mongoose.Types.ObjectId;

class FriendService {
  async getListFriends(userId) {
    const friends = await Friend.aggregate([
      {
        $project: {
          userIds: 1,
          _id: 0,
        },
      },
      {
        $match: {
          userIds: {
            $in: [ObjectId(userId)],
          },
        },
      },
      {
        $unwind: "$userIds",
      },
      {
        $match: {
          userIds: {
            $ne: ObjectId(userId),
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userIds",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: "$user._id",
          userName: "$user.userName",
          email: "$user.email",
          avatar: "$user.avatar",
          gender: "$user.gender",
          dateOfBirth: "$user.dateOfBirth",
        },
      },
    ]);
    const result = await Promise.all(
      friends.map(async (friend) => {
        const conversationId = await Conversation.getConversationByMembers(
          userId,
          friend._id
        );
        return { ...friend, conversationId: conversationId._id };
      })
    );

    return result;
  }
  async getListNotFriendsAndNotRequestFriend(userId) {
    const senderRequests = await FriendRequest.aggregate([
      {
        $match: {
          senderId: ObjectId(userId),
        },
      },
      {
        $unwind: "$receiverId",
      },
    ]);
    const receiverRequests = await FriendRequest.aggregate([
      {
        $match: {
          receiverId: ObjectId(userId),
        },
      },
      {
        $unwind: "$senderId",
      },
    ]);
    const friend = await Friend.aggregate([
      {
        $match: {
          userIds: {
            $in: [ObjectId(userId)],
          },
        },
      },
      {
        $unwind: "$userIds",
      },
      {
        $match: {
          userIds: {
            $ne: ObjectId(userId),
          },
        },
      },
      {
        $unwind: "$userIds",
      },
    ]);

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
          _id: 1,
          userName: 1,
          email: 1,
          avatar: 1,
          gender: 1,
          dateOfBirth: 1,
        },
      },
    ]);

    const userNotFriends = users.filter((user) => {
      return (
        !senderRequests.some((request) => {
          return request.receiverId.toString() === user._id.toString();
        }) &&
        !receiverRequests.some((request) => {
          return request.senderId.toString() === user._id.toString();
        }) &&
        !friend.some((f) => {
          return f.userIds.toString() === user._id.toString();
        })
      );
    });
    return userNotFriends;
  }
  async getReceivedInvite(userId) {
    const friendRequests = await FriendRequest.aggregate([
      {
        $match: {
          receiverId: ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $project: {
          userName: "$user.userName",
          _id: "$user._id",
          email: "$user.email",
          dateOfBirth: "$user.dateOfBirth",
          gender: "$user.gender",
          avatar: "$user.avatar",
        },
      },
      {
        $unwind: "$_id",
      },
      {
        $unwind: "$userName",
      },
      {
        $unwind: "$email",
      },
      {
        $unwind: "$avatar",
      },
      {
        $unwind: "$gender",
      },
      {
        $unwind: "$dateOfBirth",
      },
    ]);
    return friendRequests;
  }
}

module.exports = new FriendService();
