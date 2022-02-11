const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const memberSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
    conversation: {
      type: ObjectId,
      ref: "Conversation",
    },
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Member = mongoose.model("Member", memberSchema);
module.exports = Member;
