import mongoose from "mongoose";

const Posts = mongoose.Schema({
  user: {
    username: String,
    image: { name: String, base64: String },
    isPrivate: Boolean,
  },
  body: String,
  tags: [String],
  images: [{ name: String, base64: String }],
  visitCount: {
    type: Number,
    default: 0,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Post = mongoose.model("Posts", Posts);

export default Post;
