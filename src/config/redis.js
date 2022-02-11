const Redis = require("ioredis");

const redis = new Redis({
  port: process.env.REDIS_PORT, // Redis port
  host: process.env.REDIS_HOST, // Redis host
  // family: 4, // 4 (IPv4) or 6 (IPv6)
  password: process.env.REDIS_PASSWORD,
  // db: 0,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("ready", () => {
  console.log("Redis ready");
});

redis.on("error", (err) => {
  console.log("Redis error", err);
});
redis.on("end", () => {
  console.log("Redis end");
});
process.on("SIGINT", () => {
  redis.quit();
});

module.exports = redis;
