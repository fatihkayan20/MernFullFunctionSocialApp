import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Controllers
import postController from "./controller/PostController.js";
import userController from "./controller/UserController.js";
import commentController from "./controller/CommentController.js";
import replyController from "./controller/ReplyController.js";
import followsController from "./controller/FollowsController.js";

const app = express();

dotenv.config();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users", userController);
app.use("/posts", postController);
app.use("/comments", commentController);
app.use("/replies", replyController);
app.use("/follows", followsController);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
