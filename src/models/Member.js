const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const memberSchema = new Schema(
  {
    userId: {
      type: ObjectId,
    },
    conversationId: {
      type: ObjectId,
    },
    name: {
      type: String,
    },
    lastView: {
      type: Date,
      default: new Date(),
    },
    isRead: {
      default: false,
      type: Boolean,
    },
    isDeleteConversation: {
      default: false,
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

memberSchema.statics.getByConversationIdAndUserId = async function (
  conversationId,
  userId
) {
  const member = await this.findOne({
    userId,
    conversationId,
  });
  if (!member) {
    throw new Error("Not found member");
  }
  return member;
};

const Member = mongoose.model("Member", memberSchema);
module.exports = Member;
