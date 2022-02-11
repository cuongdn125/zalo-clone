const { parseCookies } = require("../utils/cookie");
const { verifyAccessToken } = require("../utils/token");
const createError = require("http-errors");

const socket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
    socket.on("join", (userId) => {
      socket.userId = userId;
      console.log(`User ${userId} joined`);
    });
  });
};

module.exports = socket;
