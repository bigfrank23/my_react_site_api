const mongoose = require("mongoose");

// // Comment schema
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: String,
    },
    message: {
      type: String,
    },
    likes: {
      type: Number,
    },
    editable: {
      type: Boolean,
    },
    replies: [{
        user: String,
        message: String,
        likes: Number
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("comment", commentSchema);
