const { parseCookies } = require("../utils/cookie");
const { verifyAccessToken } = require("../utils/token");
const createError = require("http-errors");

const auth = (req, res, next) => {
  try {
    const token = req.headers.cookie;
    const accessToken = parseCookies(token).accessToken;
    if (!accessToken) {
      return next(createError(401, "Unauthorized"));
    }
    verifyAccessToken(accessToken)
      .then((decode) => {
        req.userId = decode.id;
        next();
      })
      .catch((err) => {
        return next(createError(401, err.message));
      });
  } catch (err) {
    return next(createError(401, err.message));
  }
};

module.exports = auth;
