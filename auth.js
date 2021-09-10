const jwt = require("jsonwebtoken");
module.exports = function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.send("You are not allowed");
  }
  try {
    verified = jwt.verify(token, process.env.SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.send("Invalid token");
  }
};
