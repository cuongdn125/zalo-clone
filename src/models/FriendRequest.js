const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const friendRequestSchema = new Schema(
  {
    senderId: ObjectId,
    receiverId: ObjectId,
  },
  {
    timestamps: true,
  }
);

friendRequestSchema.statics.isExitFriendRequest = async function (
  senderId,
  receiverId
) {
  const friendRequest = await this.findOne({
    $or: [
      {
        senderId: senderId,
        receiverId: receiverId,
      },
      {
        senderId: receiverId,
        receiverId: senderId,
      },
    ],
  });
  return !!friendRequest;
};

friendRequestSchema.statics.isSenderRequest = async function (
  userId,
  friendId
) {
  const friendRequest = await this.findOne({
    senderId: userId,
    receiverId: friendId,
  });
  return !!friendRequest;
};

friendRequestSchema.statics.isReceiverRequest = async function (
  userId,
  friendId
) {
  const friendRequest = await this.findOne({
    senderId: friendId,
    receiverId: userId,
  });
  return !!friendRequest;
};

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
module.exports = FriendRequest;
