const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String
  },
  user1: {
    type: String
  },
  user2: {
    type: String
  }
});

module.exports = mongoose.model("rooms", schema);
