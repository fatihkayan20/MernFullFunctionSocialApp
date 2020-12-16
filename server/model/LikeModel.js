import mongoose from "mongoose";

const Likes = mongoose.Schema({
  user: {
    username: String,
    image: { name: String, base64: String },
  },
  post: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Like = mongoose.model("Likes", Likes);

export default Like;
