import express from "express";
import { auth } from "../middleware/auth.js";

import {
  createComment,
  updateComment,
  deleteComment,
} from "../view/CommentView.js";

const comment = express.Router();

comment.post("/:id", auth, createComment);
comment.put("/:id", auth, updateComment);
comment.delete("/:id", auth, deleteComment);

export default comment;
