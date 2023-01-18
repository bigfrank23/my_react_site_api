const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
// Post schema
const postSchema = new mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    // userId: {
    //   type: String,
    // },
    pageId: { String },
    title: {
      type: String,
    },
    cloudinary_id: {
      type: String,
    },
    avatar: {
      type: String,
    },
    desc: {
      type: String,
    },
    creator: {
      type: String,
    },
    username: {
      type: String,
    },
    profilePic: {
      type: String,
      default: "",
    },
    // likes: [{ type: ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    // comments: {
    //   type: [String],
    //   default: [],
    // },
    // commentWriter: {
    //   type: String
    // },
    // comments: [
    //   {
    //     type: Object,
    //     // contains: {
    //     _id: { type: ObjectId },
    //     commentId: { type: String },
    //     user: { type: String },
    //     profilePic: { type: String },
    //     message: { type: String },
    //     createdTime: { type: String },
    //     commentImage: { type: String },
    //     likes: [
    //       {
    //         default: { userName: "Franklin" },
    //         userPic: { type: String },
    //         userName: { type: String },
    //       },
    //     ],
    //     // },
    //   },
    // ],
    comments: [
      {
        text: String,
        date: { type: Date, default: Date.now },
        user: String,
        profilePic: String,
        commentImage: String,
        likes: [],
      },
    ],
    likes: [
      {
        userId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
        },
      },
    ],
    label: {
      type: String,
    },
    user: {
      type: String,
    },
    message: {
      type: String,
    },
    editable: {
      type: Boolean,
    },
    replies: [
      {
        user: String,
        message: String,
        likes: Number,
      },
    ],
  },
  { timestamps: true }
);

// console.log(postSchema.obj.comments[0].contains.message)
module.exports = mongoose.model("post", postSchema);
