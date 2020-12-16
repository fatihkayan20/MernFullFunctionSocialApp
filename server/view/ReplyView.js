import Comment from "../model/CommentModel.js";
import Notification from "../model/NotificationModel.js";
import Post from "../model/PostModel.js";

export const replyComment = (req, res) => {
  const commentId = req.params.id;

  const replyData = {
    user: req.user,
    comment: commentId,
    body: req.body.body,
  };

  Comment.findOne({ _id: commentId }).then((comment) => {
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    } else {
      comment.replies.push(replyData);

      if (req.user.username !== comment.user.username) {
        const newNot = new Notification({
          sender: req.user,
          recipient: comment.user.username,
          post: comment.post,
          type: "replied",
        });
        newNot.save();
      }

      Post.findOne({ _id: comment.post }).then((post) => {
        if (
          post.user.username !== comment.user.username &&
          post.user.username !== req.user.username
        ) {
          const newNot2 = new Notification({
            sender: req.user,
            recipient: comment.user.username,
            post: post._id,
            type: "commented",
          });
          newNot2.save();
        }

        comment.save().then((comment) => {
          return res.status(201).json(comment);
        });
      });
    }
  });
};

export const deleteReply = (req, res) => {
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;

  Comment.findOne({
    _id: commentId,
    "replies._id": replyId,
    "replies.user.username": req.user.username,
  }).then((comment) => {
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    } else {
      Comment.updateOne(
        { _id: commentId, "replies._id": replyId },
        { $pull: { replies: { _id: replyId } } }
      ).then(() => {
        Comment.findOne({ _id: commentId }).then((updatedComment) => {
          return res.json(updatedComment.replies);
        });
      });
    }
  });
};

export const updateReply = (req, res) => {
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;

  Comment.findOne({
    _id: commentId,
    "replies._id": replyId,
    "replies.user.username": req.user.username,
  }).then((comment) => {
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    } else {
      Comment.updateOne(
        { _id: commentId, "replies._id": replyId },
        { $set: { "replies.$.body": req.body.body } }
      ).then(() => {
        Comment.findOne({ _id: commentId }).then((updatedComment) => {
          return res.json(updatedComment.replies);
        });
      });
    }
  });
};
