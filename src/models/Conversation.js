const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const conversationSchema = new Schema(
  {
    name: {
      type: String,
    },
    avatar: String,
    manager: {
      type: ObjectId,
      ref: "User",
    },
    members: {
      type: [ObjectId],
      ref: "Member",
    },
    messages: {
      type: [ObjectId],
      ref: "Message",
      default: [],
    },
    type: Boolean,
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
