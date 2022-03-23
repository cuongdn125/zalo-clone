const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const messageSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    conversationId: ObjectId,
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

messageSchema.statics.getById = async function (id) {
  const lastMessage = await this.aggregate([
    {
      $match: {
        _id: ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "userId",
        foreignField: "userId",
        as: "member",
      },
    },
  ]);
};

messageSchema.statics.getMessageByConversationId = async function (
  conversationId
) {
  const messages = await this.aggregate([
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
  ]);
  return messages;
};

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
