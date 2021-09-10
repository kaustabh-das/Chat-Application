const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  mssz: {
    type: String
  },
  name: {
    type: String
  }
});

module.exports = schema;
