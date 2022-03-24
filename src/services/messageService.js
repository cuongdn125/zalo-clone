const { uploadImage } = require("../utils/uploadFile");
const Message = require("../models/Message");
const dateUtils = require("../utils/dateUtils");
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const ObjectId = mongoose.Types.ObjectId;

class MessageService {
  async createMessage(conversationId, content, type, userId) {
    if (type === "text") {
      const message = await Message.create({
        conversationId,
        content,
        type,
        userId,
      });
      const result = await Message.aggregate([
        {
          $match: {
            _id: ObjectId(message._id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            "user.password": 0,
          },
        },
      ]);
      result[0].time = dateUtils.toTime(result[0].createdAt);
      // console.log("result", result[0]);
      return result[0];
    }
    if (type === "image") {
      const image = await uploadImage(content);
      const message = await Message.create({
        conversationId,
        content: image,
        type,
        userId,
      });
      const result = await Message.aggregate([
        {
          $match: {
            _id: ObjectId(message._id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            "user.password": 0,
          },
        },
      ]);
      result[0].time = dateUtils.toTime(result[0].createdAt);

      return result[0];
    }
  }
  async getListMessage(conversationId) {
    const messages = await Message.aggregate([
      {
        $match: {
          conversationId: ObjectId(conversationId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          "user.password": 0,
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ]);
    return messages;
  }

  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findOne({
        _id: messageId,
        userId,
      });
      if (!message) {
        throw new Error("Not found message");
      }
      const members = await Conversation.aggregate([
        {
          $match: {
            _id: ObjectId(message.conversationId),
          },
        },
        {
          $unwind: "$members",
        },
        {
          $project: {
            members: 1,
          },
        },
        // {
        //   $match: {
        //     members: {
        //       $ne: ObjectId(userId),
        //     },
        //   },
        // },
      ]);

      await message.remove();

      return members;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new MessageService();
