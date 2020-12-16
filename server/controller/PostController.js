import express from "express";
import { auth, secondAuth } from "../middleware/auth.js";

import {
  createPost,
  getPostDetails,
  updatePost,
  deletePost,
  likePost,
  getAllPostsAsAdmin,
  getFollowedPosts,
  explorePosts,
} from "../view/PostView.js";

const post = express.Router();

post.get("/getAllPostsAsAdmin", getAllPostsAsAdmin);
post.get("/", auth, getFollowedPosts);
post.get("/explore", explorePosts);
post.post("/", auth, createPost);
post.get("/:id", secondAuth, getPostDetails);
post.put("/:id", auth, updatePost);
post.delete("/:id", auth, deletePost);

post.get("/:id/like", auth, likePost);

export default post;
