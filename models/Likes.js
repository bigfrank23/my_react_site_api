const mongoose = require("mongoose");

const likesSchema = new mongoose.Schema({
  likes: { type: Number, default: 0 },
});

module.exports = mongoose.model("likes", likesSchema);