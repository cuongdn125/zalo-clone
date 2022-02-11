const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const messageSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
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

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
