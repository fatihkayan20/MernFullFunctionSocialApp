import mongoose from "mongoose";

const Follows = mongoose.Schema({
  follower: String,
  followed: String,
  isAccept: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() },
});

const Follow = mongoose.model("Follows", Follows);

export default Follow;
