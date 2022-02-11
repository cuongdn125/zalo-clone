const JWT = require("jsonwebtoken");
const redis = require("../config/redis");
const createError = require("http-errors");

const generateAccessToken = (data) => {
  return new Promise((resolve, reject) => {
    JWT.sign(
      data,
      process.env.JWT_SECRET_ACCESS_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_LIFE },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
};

const verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, process.env.JWT_SECRET_ACCESS_KEY, (err, decoded) => {
      if (err) reject(createError(401, err.message));
      resolve(decoded);
    });
  });
};

const generateRefreshToken = (data) => {
  return new Promise((resolve, reject) => {
    JWT.sign(
      data,
      process.env.JWT_SECRET_REFRESH_KEY,
      { expiresIn: process.env.REFRESH_TOKEN_LIFE },
      (err, token) => {
        if (err) {
          reject(err);
          return;
        }
        redis.set(data.id, token, "EX", 7 * 24 * 60 * 60, (err, reply) => {
          if (err) {
            reject(err);
          } else {
            resolve(token);
          }
        });
      }
    );
  });
};

const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, process.env.JWT_SECRET_REFRESH_KEY, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      redis.get(decoded.id, (err, reply) => {
        if (err) {
          reject(err);
          return;
        } else if (reply === token) {
          resolve(decoded);
        } else {
          reject(createError(403, "Invalid refresh token"));
        }
      });
    });
  });
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
