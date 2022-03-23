const ConversationController = require("../controllers/ConversationController");

const router = require("express").Router();

const conversationRouter = (io) => {
  const conversationController = new ConversationController(io);
  router.get("/", conversationController.getListConversation);
  router.get("/group", conversationController.getListGroupConversation);
  router.get("/:conversationId", conversationController.getConversation);
  router.post("/", conversationController.createGroupConversation);
  router.post(
    "/individual",
    conversationController.createIndividualConversation
  );
  router.delete("/:conversationId", conversationController.deleteConversation);
  return router;
};

module.exports = conversationRouter;
