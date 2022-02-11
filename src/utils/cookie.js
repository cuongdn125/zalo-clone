function parseCookies(token) {
  var list = {};
  var rc = token;
  rc.split(";").forEach(function (cookie) {
    var parts = cookie.split("=");
    list[parts.shift().trim()] = decodeURI(parts.join("="));
  });

  return list;
}

module.exports = {
  parseCookies,
};
