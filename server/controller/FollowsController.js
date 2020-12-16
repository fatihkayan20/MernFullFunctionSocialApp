import express from "express";
import { auth, secondAuth } from "../middleware/auth.js";

import {
  followUser,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../view/FollowView.js";

const follow = express.Router();

follow.get("/:id", auth, followUser);
follow.get("/:id/accept", auth, acceptFollowRequest);
follow.get("/:id/reject", auth, rejectFollowRequest);

export default follow;
