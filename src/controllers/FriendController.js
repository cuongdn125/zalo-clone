const ObjectId = require("mongoose").Types.ObjectId;
const Friend = require("../models/Friend");
const FriendService = require("../services/friendService");
const FriendRequest = require("../models/FriendRequest");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Member = require("../models/Member");
const friendService = require("../services/friendService");
const conversationService = require("../services/conversationService");
const createError = require("http-errors");

const redis = require("../config/redis");

class FriendController {
  constructor(io) {
    this.io = io;

    this.sendInvite = this.sendInvite.bind(this);
    this.acceptInvite = this.acceptInvite.bind(this);
    this.deleteFriend = this.deleteFriend.bind(this);
    this.cancelInvite = this.cancelInvite.bind(this);
  }

  async getListFriend(req, res, next) {
    const { userId } = req;
    try {
      const friends = await FriendService.getListFriends(userId);

      res.json({
        success: true,
        data: friends,
      });
    } catch (e) {
      next(e);
    }
  }

  async getListNotFriends(req, res, next) {
    const { userId } = req;
    try {
      const friends = await FriendService.getListNotFriendsAndNotRequestFriend(
        userId
      );

      res.json({
        success: true,
        data: friends,
      });
    } catch (e) {
      next(e);
    }
  }
  async getReceivedInvite(req, res, next) {
    const { userId } = req;
    try {
      const receivedInvite = await FriendService.getReceivedInvite(userId);

      res.json({
        success: true,
        data: receivedInvite,
      });
    } catch (e) {
      next(e);
    }
  }

  async sendInvite(req, res, next) {
    try {
      const { data } = req.body;
      // console.log(data);
      if (!data?._id) {
        return next(createError(400, "Missing data"));
      }
      const { userId } = req;
      const isExit = await FriendRequest.isExitFriendRequest(data._id, userId);
      if (!isExit) {
        const friendRequest = await FriendRequest.create({
          senderId: userId,
          receiverId: data._id,
        });
        const inviteFiend = await friendService.getReceivedInvite(data._id);
        // console.log(inviteFiend);
        const listNotFiend =
          await friendService.getListNotFriendsAndNotRequestFriend(data._id);
        if (friendRequest) {
          const id = await redis.get(`${data._id}online`);
          this.io.to(id).emit("invite-friend", {
            inviteFiend,
            listNotFiend,
            senderId: userId,
          });
        }
        return res.json({
          success: true,
        });
      } else {
        return next(createError(400, "was sent a friend request"));
      }
    } catch (e) {
      next(e);
    }
  }

  async acceptInvite(req, res, next) {
    try {
      const { data } = req.body;
      // console.log(data);
      if (!data?._id) {
        return next(createError(400, "Missing data"));
      }
      const { userId } = req;
      const isExit = await FriendRequest.findOne({
        senderId: data._id,
        receiverId: userId,
      });
      if (isExit) {
        await Friend.create({
          userIds: [userId, data._id],
        });
        let conversation = await Conversation.getConversationByMembers(
          data._id,
          userId
        );
        if (!conversation) {
          conversation = await Conversation.create({
            members: [userId, data._id],
            type: false,
          });
          await Member.insertMany([
            {
              userId: userId,
              conversationId: conversation._id,
            },
            {
              userId: data._id,
              conversationId: conversation._id,
            },
          ]);
        }
        await FriendRequest.deleteOne({
          senderId: data._id,
          receiverId: userId,
        });
        const senderId = await redis.get(`${data._id}online`);
        const receiverId = await redis.get(`${userId}online`);
        const conversationSender = await conversationService.getConversation(
          conversation._id,
          userId
        );
        const conversationReceiver = await conversationService.getConversation(
          conversation._id,
          data._id
        );
        this.io.to(receiverId).emit("add-conversation", {
          data: conversationSender,
        });
        this.io.to(senderId).emit("add-conversation", {
          data: conversationReceiver,
        });
        this.io.to(senderId).emit("accept-invite-friend-success", {
          senderId: userId,
          // data: listInvite,
        });
        return res.json({
          success: true,
        });
      } else {
        return next(createError(400, "not sent a friend request"));
      }
    } catch (e) {
      next(e);
    }
  }
  async deleteFriend(req, res, next) {
    try {
      const { data } = req.body;
      // console.log(data);
      if (!data?._id) {
        return next(createError(400, "Missing data"));
      }
      const { userId } = req;
      const isExit = await Friend.isFriend(data._id, userId);
      if (isExit) {
        await Friend.deleteOne({
          userIds: {
            $all: [userId, data._id],
          },
        });
        const id1 = await redis.get(`${data._id}online`);
        // const id2 = await redis.get(`${userId}online`);
        const conversation = await Conversation.getConversationByMembers(
          data._id,
          userId
        );
        const user1 = await User.findOne({ _id: userId });
        // const user2 = await User.findOne({ _id: data._id });
        // console.log(id2);

        this.io.to(id1).emit("delete-friend-success", {
          senderId: userId,
          conversationId: conversation._id,
          user: {
            _id: user1._id,
            userName: user1.userName,
            avatar: user1.avatar,
            email: user1.email,
            dateOfBirth: user1.dateOfBirth,
            gender: user1.gender,
          },
        });
        // this.io.to(id2).emit("delete-friend-success", {
        //   user: {
        //     _id: user2._id,
        //     userName: user2.userName,
        //     avatar: user2.avatar,
        //     email: user2.email,
        //     dateOfBirth: user2.dateOfBirth,
        //     gender: user2.gender,
        //   },
        // });
        return res.json({
          success: true,
        });
      } else {
        return next(createError(400, "not friend"));
      }
    } catch (e) {
      next(e);
    }
  }

  async cancelInvite(req, res, next) {
    try {
      const { data } = req.body;
      // console.log(data);
      if (!data?._id) {
        return next(createError(400, "Missing data"));
      }
      const { userId } = req;
      const isExit = await FriendRequest.isExitFriendRequest(data._id, userId);
      if (isExit) {
        await FriendRequest.deleteOne({
          $or: [
            {
              senderId: data._id,
              receiverId: userId,
            },
            {
              senderId: userId,
              receiverId: data._id,
            },
          ],
        });
        const listNotFiend =
          await friendService.getListNotFriendsAndNotRequestFriend(data._id);

        const senderId = await redis.get(`${data._id}online`);
        this.io.to(senderId).emit("cancel-invite-friend-success", {
          senderId: userId,
          listNotFiend,
        });
        return res.json({
          success: true,
        });
      } else {
        return next(createError(400, "not sent a friend request"));
      }
    } catch (e) {
      next(e);
    }
  }
}

module.exports = FriendController;
