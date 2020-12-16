import express from "express";
import { auth } from "../middleware/auth.js";
import { replyComment, deleteReply, updateReply } from "../view/ReplyView.js";

const reply = express.Router();

reply.post("/:id", auth, replyComment);
reply.delete("/:commentId/:replyId", auth, deleteReply);
reply.put("/:commentId/:replyId", auth, updateReply);

export default reply;
