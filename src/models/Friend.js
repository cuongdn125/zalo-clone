const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const friendSchema = new Schema({
  userIds: [ObjectId],
});

friendSchema.statics.isFriend = async function (userId, friendId) {
  const friend = await this.findOne({
    userIds: {
      $all: [userId, friendId],
    },
  });
  return !!friend;
};

const Friend = mongoose.model("Friend", friendSchema);
module.exports = Friend;
