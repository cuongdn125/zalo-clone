const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const conversationSchema = new Schema(
  {
    name: {
      type: String,
    },
    avatar: String,
    managerId: {
      type: ObjectId,
    },
    lastMessageId: ObjectId,
    members: {
      type: [ObjectId],
    },
    type: Boolean,
  },
  {
    timestamps: true,
  }
);

conversationSchema.statics.isExitConversation = async function (
  conversationId
) {
  const conversation = await this.findOne({
    _id: conversationId,
  });
  if (!conversation) throw new Error("Conversation not found");
  return conversation;
};

conversationSchema.statics.getConversationByMembers = async function (
  senderId,
  receiverId
) {
  return await this.findOne({
    members: {
      $all: [ObjectId(senderId), ObjectId(receiverId)],
    },
  });
};

conversationSchema.statics.getListConversation = async function (userId) {
  return await this.find({
    members: {
      $in: [ObjectId(userId)],
    },
  }).sort({
    updatedAt: -1,
  });
};

conversationSchema.statics.getListNameAndAvatar = async function (
  conversationId
) {
  return await this.aggregate([
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
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        name: "$user.name",
        avatar: "$user.avatar",
      },
    },
  ]);
};

conversationSchema.statics.isExitUser = async function (
  userId,
  conversationId
) {
  const conversation = await this.findOne({
    _id: conversationId,
    members: {
      $in: [ObjectId(userId)],
    },
  });
  if (!conversation) throw new Error("Conversation not found");
  return conversation;
};

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
