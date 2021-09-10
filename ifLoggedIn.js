const jwt = require("jsonwebtoken");

function loggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    next();
  }
  try {
    verified = jwt.verify(token, process.env.SECRET);
    req.user = verified;
    res.redirect("home");
  } catch (err) {
    next();
  }
}
module.exports = loggedIn;
