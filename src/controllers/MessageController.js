const messageService = require("../services/messageService");
const { uploadImage } = require("../utils/uploadFile");

const Conversation = require("../models/Conversation");
const redis = require("../config/redis");

const ObjectId = require("mongoose").Types.ObjectId;

class MessageController {
  constructor(io) {
    this.io = io;
    this.createMessage = this.createMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
  }

  async createMessage(req, res, next) {
    const { userId } = req;
    try {
      const { conversationId, content, type } = req.body;
      //   console.log("message", conversationId, content, type);

      const message = await messageService.createMessage(
        conversationId,
        content,
        type,
        userId
      );
      // console.log("message", message);
      const receiver_id = await Conversation.aggregate([
        {
          $match: {
            _id: ObjectId(conversationId),
          },
        },
        {
          $unwind: "$members",
        },

        {
          $lookup: {
            from: "users",
            localField: "members",
            foreignField: "_id",
            as: "members",
          },
        },
        {
          $unwind: "$members",
        },
        {
          $project: {
            _id: 0,
            id: "$members._id",
          },
        },
      ]);
      for (const item of receiver_id) {
        const socketId = await redis.get(`${item.id}online`);
        await this.io.to(socketId).emit("newMessage", message);
      }

      res.json({
        success: true,
        data: message,
      });
    } catch (err) {
      next(err);
    }
  }

  async getListMessage(req, res, next) {
    const { conversationId } = req.params;
    const { userId } = req;
    try {
      const conversation = await Conversation.isExitUser(
        userId,
        conversationId
      );

      const messages = await messageService.getListMessage(conversationId);
      res.json({
        success: true,
        data: messages,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteMessage(req, res, next) {
    const { messageId } = req.params;
    const { userId } = req;
    try {
      const members = await messageService.deleteMessage(messageId, userId);
      for (const member of members) {
        const socketId = await redis.get(`${member.members}online`);
        await this.io.to(socketId).emit("deleteMessage", {
          data: { conversationId: member._id, messageId },
        });
      }
      res.json({
        success: true,
        data: members,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MessageController;
