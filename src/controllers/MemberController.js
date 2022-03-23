const Member = require("../models/Member");

class MemberController {
  constructor() {}
  async updateMember(req, res, next) {
    const { userId } = req;
    try {
      const { conversationId } = req.body;
      if (!conversationId) {
        throw new Error("Not found conversationId");
      }
      const member = await Member.getByConversationIdAndUserId(
        conversationId,
        userId
      );
      member.lastView = new Date();
      member.isRead = true;
      await member.save();
      console.log("object");
      res.json({
        status: "success",
        data: member,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MemberController();
