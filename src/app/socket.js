const redis = require("../config/redis");

const socket = (io) => {
  io.on("connection", (socket) => {
    // console.log("New client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      redis.del(`${socket.userId}online`);
    });
    socket.on("leave", () => {
      console.log(`${socket.userId} leave`);
      redis.del(`${socket.userId}online`);
    });
    socket.on("join", ({ userId }) => {
      socket.userId = userId;
      console.log(`User ${userId} joined`);
      redis.set(`${userId}online`, socket.id);
    });
  });
};

module.exports = socket;
