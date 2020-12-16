import mongoose from "mongoose";

const Users = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6 },
  image: { name: String, base64: String },
  bio: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
  isPrivate: { type: Boolean, default: true },
  followerCount: {
    type: Number,
    default: 0,
  },
  followCount: {
    type: Number,
    default: 0,
  },
  postCount: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model("Users", Users);

export default User;
