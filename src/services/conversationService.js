const Friend = require("../models/Friend");
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Member = require("../models/Member");
const Message = require("../models/Message");
const dateUtils = require("../utils/dateUtils");
const { uploadImage } = require("../utils/uploadFile");
const ObjectId = mongoose.Types.ObjectId;

class ConversationService {
  // constructor() {
  //   this.getGroupConversation = this.getGroupConversation.bind(this);
  // }
  async getListConversation(userId) {
    const conversations = await Conversation.getListConversation(userId);
    // console.log(conversations);
    const conversationIds = conversations.map(
      (conversation) => conversation._id
    );
    return await this.getListSummaryByIds(conversationIds, userId);
  }

  async getConversation(conversationId, userId) {
    const conversation = await Conversation.isExitConversation(conversationId);
    if (conversation) {
      return await this.getSummaryByIdAndUserId(conversationId, userId);
    }
  }

  async getListSummaryByIds(conversationIds, userId) {
    const conversationResults = [];
    for (const conversationId of conversationIds) {
      //   console.log("object");
      const conversation = await this.getSummaryByIdAndUserId(
        conversationId,
        userId
      );
      if (conversation) conversationResults.push(conversation);
    }
    // console.log(conversationResults); loi
    return conversationResults;
  }
  async getSummaryByIdAndUserId(conversationId, userId) {
    // console.log("object");
    const member = await Member.getByConversationIdAndUserId(
      conversationId,
      userId
    );
    // console.log("member", member);

    const conversation = await Conversation.findOne({
      _id: conversationId,
    });
    const { lastMessageId, type, members, managerId } = conversation;

    // const messages = await Message.getMessageByConversationId(conversationId);
    // console.log("messages", messages);
    // if (messages.length <= 0 && typeGet) {
    //   // console.log("messages", messages);
    //   return;
    // }

    let nameAndAvatar;
    if (type) {
      nameAndAvatar = await this.getGroupConversation(conversation);
    } else {
      nameAndAvatar = await this.getIndividualConversation(
        conversationId,
        userId
      );
    }
    const message = await Message.aggregate([
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
    const lastMessage = message[message.length - 1];
    // console.log(lastMessage);
    if (message.length > 0) {
      lastMessage.time = dateUtils.toTime(lastMessage?.createdAt);
    }

    return {
      isRead: member.isRead,
      conversationId,
      ...nameAndAvatar,
      type,
      message,
      lastMessage,
      managerId,
      members,
    };
  }

  async getGroupConversation(conversation) {
    const { _id, name, avatar, members } = conversation;
    const result = {
      _id,
      name: name,
      avatar: avatar,
      members: members,
    };
    let groupAvatar = [];
    if (!avatar || avatar === "") {
      const nameAndAvatar = await Conversation.getListNameAndAvatar(_id);
      // console.log("nameAndAvatar", nameAndAvatar);
      for (const tempt of nameAndAvatar) {
        // const nameTempt = tempt.name;
        const { avatar } = tempt;

        // groupName += `, ${nameTempt}`;
        groupAvatar.push(avatar);
      }
    }

    if (!avatar || avatar === "") {
      result.avatar = groupAvatar;
    }
    return result;
  }

  async getListGroupConversation(userId) {
    const conversation = await Conversation.find({
      type: true,
      members: { $in: [userId] },
    });
    // console.log(conversation);
    if (conversation.length <= 0) return [];
    let result = [];
    for (const item of conversation) {
      const r = await this.getGroupConversation(item);
      result.push(r);
    }
    return result;
  }
  async getIndividualConversation(conversationId, userId) {
    const memberIds = await Conversation.aggregate([
      {
        $match: {
          _id: ObjectId(conversationId),
        },
      },
      {
        $project: {
          _id: 0,
          members: 1,
        },
      },
      {
        $unwind: "$members",
      },
    ]);
    const isFriend = await Friend.isFriend(
      memberIds[0].members,
      memberIds[1].members
    );
    // console.log("isFriend", isFriend);
    // console.log("memberIds", memberIds);
    const datas = await Member.aggregate([
      {
        $match: {
          conversationId: ObjectId(conversationId),
          userId: { $ne: ObjectId(userId) },
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
          _id: 0,
          name: "$user.userName",
          avatar: "$user.avatar",
        },
      },
    ]);
    const conversation = { ...datas[0], isFriend: isFriend };
    return conversation;
  }

  async createGroupConversation(name, managerId, avatar, users) {
    try {
      users.push(managerId);
      let urlAvatar;
      if (avatar) {
        urlAvatar = await uploadImage(avatar);
      }
      const conversation = await Conversation.create({
        name,
        managerId,
        avatar: urlAvatar,
        members: users,
        type: true,
      });
      const members = users.map((user) => ({
        conversationId: conversation._id,
        userId: user,
      }));
      const x = await Member.insertMany(members);
      console.log("x", x);

      return await this.getSummaryByIdAndUserId(conversation._id, managerId);

      // return { conversation, members: x };
    } catch (e) {
      throw new Error(e);
    }
  }

  async createIndividualConversation(userId, friendId) {
    try {
      const conversation = await Conversation.getConversationByMembers(
        userId,
        friendId
      );
      if (conversation) {
        return { conversation: conversation, type: true };
      } else {
        const conversation = await Conversation.create({
          members: [userId, friendId],
        });
        const members = [
          {
            conversationId: conversation._id,
            userId,
          },
          {
            conversationId: conversation._id,
            userId: friendId,
          },
        ];
        const x = await Member.insertMany(members);
        return { conversation: conversation, type: false };
      }
    } catch (e) {
      throw new Error(e);
    }
  }
  async deleteConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      if (conversation.type) {
        if (userId !== conversation.managerId.toString()) {
          throw new Error("You are not manager of this group");
        }
      }
      const members = await Member.find({
        conversationId: ObjectId(conversationId),
        // $ne: { userId: ObjectId(userId) },
      });
      if (members.length <= 0) {
        throw new Error("Members not found");
      }
      const x = await Message.deleteMany({
        conversationId: ObjectId(conversationId),
      });
      if (conversation.type) {
        const y = await Member.deleteMany({
          conversationId: ObjectId(conversationId),
        });
        const z = await Conversation.deleteOne({
          _id: ObjectId(conversationId),
        });
      }

      return members;
    } catch (e) {
      throw new Error(e);
    }
  }
}

module.exports = new ConversationService();
