const router = require("express").Router();

const MessageController = require("../controllers/MessageController");

const messageRouter = (io) => {
  const messageController = new MessageController(io);
  router.post("/", messageController.createMessage);
  router.get("/:conversationId", messageController.getListMessage);
  router.delete("/:messageId", messageController.deleteMessage);
  return router;
};

module.exports = messageRouter;
