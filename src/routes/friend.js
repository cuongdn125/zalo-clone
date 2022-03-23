const router = require("express").Router();
const FriendController = require("../controllers/FriendController");

const friendRouter = (io) => {
  const friendController = new FriendController(io);
  router.get("/", friendController.getListFriend);
  router.get("/recommendInvite", friendController.getListNotFriends);
  router.get("/receiveInvite", friendController.getReceivedInvite);
  router.post("/sendInvite", friendController.sendInvite);
  router.post("/acceptInvite", friendController.acceptInvite);
  router.post("/deleteFriend", friendController.deleteFriend);
  router.post("/cancelInvite", friendController.cancelInvite);

  return router;
};

module.exports = friendRouter;
