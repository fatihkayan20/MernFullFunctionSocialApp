import jwt from "jsonwebtoken";
import User from "../model/UserModel.js";

export function auth(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, "sl_myJwtSecret");

    req.user = decoded;

    next();
  } catch (error) {
    res.status(400).json({ error: "Token is not valid" });
  }
}

export function secondAuth(req, res, next) {
  const token = req.header("x-auth-token");

  try {
    const decoded = jwt.verify(token, "sl_myJwtSecret");

    req.user = decoded;

    next();
  } catch (error) {
    req.user = {
      username: "",
      image: "",
      isPrivate: false,
    };

    next();
  }
}
