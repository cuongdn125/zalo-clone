const ObjectId = require("mongoose").Types.ObjectId;
const redis = require("../config/redis");
const Conversation = require("../models/Conversation");
const Friend = require("../models/Friend");
const conversationService = require("../services/conversationService");

class ConversationController {
  constructor(io) {
    this.io = io;
    this.createGroupConversation = this.createGroupConversation.bind(this);
    this.createIndividualConversation =
      this.createIndividualConversation.bind(this);
    this.deleteConversation = this.deleteConversation.bind(this);
  }

  async getListConversation(req, res, next) {
    const { userId } = req;
    // console.log(userId);
    try {
      const conversations = await conversationService.getListConversation(
        userId
      );
      conversations.sort((a, b) => {
        return b.lastMessage?.createdAt - a.lastMessage?.createdAt;
      });
      res.json({
        success: true,
        data: conversations,
      });
    } catch (e) {
      next(e);
    }
  }
  async getConversation(req, res, next) {
    const { userId } = req;
    const { conversationId } = req.params;
    // console.log("conversationId", conversationId);

    try {
      const conversation = await conversationService.getConversation(
        conversationId,
        userId
      );
      res.json({
        success: true,
        data: conversation,
      });
    } catch (e) {
      next(e);
    }
  }
  async createGroupConversation(req, res, next) {
    const { userId } = req;
    try {
      const { avatar, name, users } = req.body;
      const conversation = await conversationService.createGroupConversation(
        name,
        userId,
        avatar,
        users
      );

      // console.log("conversation", conversation);
      const members = await Conversation.aggregate([
        {
          $match: {
            _id: ObjectId(conversation._id),
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
            _id: "$members._id",
          },
        },
      ]);
      for (const member of members) {
        const socketId = await redis.get(`${member._id}online`);
        await this.io
          .to(socketId)
          .emit("add-conversation", { data: conversation });
      }
      res.json({
        success: true,
        data: conversation,
      });
    } catch (e) {
      next(e);
    }
  }
  async getListGroupConversation(req, res, next) {
    const { userId } = req;
    try {
      const conversations = await conversationService.getListGroupConversation(
        userId
      );
      res.json({
        success: true,
        data: conversations,
      });
    } catch (e) {
      next(e);
    }
  }

  async createIndividualConversation(req, res, next) {
    const { userId } = req;
    try {
      const { receiveId } = req.body;
      const { conversation, type } =
        await conversationService.createIndividualConversation(
          userId,
          receiveId
        );
      console.log("conversation", conversation, type);
      if (!type) {
        const socketId = await redis.get(`${receiveId}online`);
        await this.io
          .to(socketId)
          .emit("add-conversation", { data: conversation });
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteConversation(req, res, next) {
    const { userId } = req;
    const { conversationId } = req.params;
    try {
      const members = await conversationService.deleteConversation(
        conversationId,
        userId
      );
      // console.log("members", members);

      for (const member of members) {
        console.log("member", member);
        const socketId = await redis.get(`${member.userId}online`);
        // console.log("socketId", socketId);
        await this.io
          .to(socketId)
          .emit("delete-conversation", { conversationId });
      }
      res.json({
        success: true,
        // data: conversation,
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = ConversationController;
