import Post from "../model/PostModel.js";
import Comment from "../model/CommentModel.js";
import Like from "../model/LikeModel.js";
import Follow from "../model/FollowModel.js";
import User from "../model/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

export const followUser = (req, res) => {
  const userId = req.params.id;

  User.findOne({ _id: userId }).then((user) => {
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      if (req.user.id === userId) {
        return res
          .status(400)
          .json({ error: "Users cannot follow yourselves" });
      } else {
        if (user.isPrivate) {
          Follow.findOne({
            follower: req.user.username,
            followed: user.username,
          }).then((follow) => {
            if (follow) {
              follow.delete().then(() => {
                user.followerCount -= 1;
                user.save().then(() => {
                  return res.json({
                    success: "User was unfollowed successfully",
                  });
                });
              });
            } else {
              const newFollow = new Follow({
                follower: req.user.username,
                followed: user.username,
                isAccept: false,
              });

              newFollow.save().then(() => {
                user.followerCount += 1;
                user.save().then(() => {
                  return res.json({
                    success: "Follow request sent successfully",
                  });
                });
              });
            }
          });
        } else {
          Follow.findOne({
            follower: req.user.username,
            followed: user.username,
          }).then((follow) => {
            if (follow) {
              follow.delete().then(() => {
                user.followerCount -= 1;
                user.save().then(() => {
                  return res.json({
                    success: "User was unfollowed successfully",
                  });
                });
              });
            } else {
              const newFollow = new Follow({
                follower: req.user.username,
                followed: user.username,
              });

              newFollow.save().then(() => {
                user.followerCount += 1;
                user.save().then(() => {
                  return res.json({
                    success: "User was followed successfully",
                  });
                });
              });
            }
          });
        }
      }
    }
  });
};

export const acceptFollowRequest = (req, res) => {
  const followId = req.params.id;

  Follow.findOne({ _id: followId }).then((follow) => {
    if (!follow) {
      return res.status(404).json({ error: "Follow not found" });
    } else {
      if (follow.followed !== req.user.username) {
        return res.status(401).json({ error: "You cannot do this" });
      } else {
        follow.isAccept = true;

        follow.save().then(() => {
          return res
            .status(200)
            .json({ success: "Follow request accepted successfully" });
        });
      }
    }
  });
};

export const rejectFollowRequest = (req, res) => {
  const followId = req.params.id;

  Follow.findOne({ _id: followId }).then((follow) => {
    if (!follow) {
      return res.status(404).json({ error: "Follow not found" });
    } else {
      if (follow.followed !== req.user.username) {
        return res.status(401).json({ error: "You cannot do this" });
      } else {
        follow.delete().then(() => {
          return res
            .status(200)
            .json({ success: "Follow request deleted successfully" });
        });
      }
    }
  });
};
