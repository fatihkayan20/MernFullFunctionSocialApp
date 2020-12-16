import Post from "../model/PostModel.js";
import Comment from "../model/CommentModel.js";
import Notification from "../model/NotificationModel.js";

export const createComment = (req, res) => {
  const postId = req.params.id;
  const commentData = {
    user: req.user,
    post: postId,
    body: req.body.body,
  };

  const newComment = new Comment(commentData);

  Post.findOne({ _id: postId }).then((post) => {
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    } else {
      post.commentCount += 1;
      post.save().then(() => {
        const newNot = new Notification({
          recipient: post.user.username,
          sender: req.user,
          post: post._id,
          type: "commented",
        });

        if (req.user.username === post.user.username) {
          newComment
            .save()
            .then((data) => {
              return res.status(201).json(data);
            })
            .catch((err) => {
              return res.status(500).json({ error: err.message });
            });
        } else {
          newNot.save().then(() => {
            newComment
              .save()
              .then((data) => {
                return res.status(201).json(data);
              })
              .catch((err) => {
                return res.status(500).json({ error: err.message });
              });
          });
        }
      });
    }
  });
};

export const updateComment = (req, res) => {
  const commentId = req.params.id;
  const body = req.body.body;

  Comment.findOne({ _id: commentId }).then((data) => {
    if (!data) {
      return res.status(404).json({ error: "Comment not found" });
    } else {
      if (data.user.username !== req.user.username) {
        return res.status(400).json({ error: "You cannot do this" });
      } else {
        data.body = body;
        data.save().then(() => {
          return res.json(data);
        });
      }
    }
  });
};

export const deleteComment = (req, res) => {
  const commentId = req.params.id;

  Comment.findOne({ _id: commentId }).then((comment) => {
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    } else {
      if (comment.user.username !== req.user.username) {
        return res.status(400).json({ error: "You cannot do this" });
      } else {
        Post.findOne({ _id: comment.post }).then((post) => {
          post.commentCount -= 1;
          post.save().then(() => {
            comment.delete().then(() => {
              Notification.findOne({
                "sender.username": req.user.username,
                recipient: post.user.username,
                post: post._id,
                type: "commented",
              })
                .then((not) => {
                  not.delete();
                })
                .then(() => {
                  return res.json({
                    success: "Comment was deleted successfully",
                  });
                });
            });
          });
        });
      }
    }
  });
};
