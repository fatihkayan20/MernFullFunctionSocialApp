import mongoose from "mongoose";

const Notifications = mongoose.Schema({
  sender: {
    username: String,
    image: { name: String, base64: String },
  },
  recipient: String,
  post: String,
  type: String,
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Notification = mongoose.model("Notifications", Notifications);

export default Notification;
