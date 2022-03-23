require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const socket = require("./src/app/socket");
const routes = require("./src/routes");
const { connect } = require("./src/config/db");

require("./src/config/redis");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

const server = http.createServer(app);
const io = socketio(server);

connect();
try {
  socket(io);
} catch (e) {
  console.log(e);
}
routes(app, io);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: true,
    status: err.status || 500,
    message: err.message,
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
