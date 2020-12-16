import express from "express";
import { auth, secondAuth } from "../middleware/auth.js";

import {
  signupUser,
  loginUser,
  getOwnUserDetails,
  getUserDetails,
  updateOwnUserDetails,
} from "../view/UserView.js";

const user = express.Router();

user.post("/signup", signupUser);
user.post("/login", loginUser);
user.get("/", auth, getOwnUserDetails);
user.post("/", auth, updateOwnUserDetails);
user.get("/:id", secondAuth, getUserDetails);

export default user;
