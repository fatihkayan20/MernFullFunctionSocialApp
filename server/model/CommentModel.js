import mongoose from "mongoose";

const Comments = mongoose.Schema({
  user: {
    username: String,
    image: { name: String, base64: String },
  },
  body: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
  post: String,
  replies: [
    {
      user: {
        username: String,
        image: { name: String, base64: String },
      },
      body: String,
      createdAt: {
        type: Date,
        default: new Date(),
      },
      comment: String,
    },
  ],
});

const Comment = mongoose.model("Comments", Comments);

export default Comment;
