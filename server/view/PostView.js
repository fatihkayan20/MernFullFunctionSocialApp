import Post from "../model/PostModel.js";
import Comment from "../model/CommentModel.js";
import Like from "../model/LikeModel.js";
import User from "../model/UserModel.js";
import Follow from "../model/FollowModel.js";

export const getAllPostsAsAdmin = (req, res) => {
  const posts = [];
  Post.find()
    .sort({ createdAt: -1 })
    .then((data) => {
      data.forEach((post) => {
        posts.push(post);
      });
    })
    .then(() => {
      return res.json(posts);
    });
};
export const getFollowedPosts = (req, res) => {
  const posts = [];
  const followedUsers = [];

  Follow.find({ follower: req.user.username })
    .then((follows) => {
      follows.forEach((follow) => {
        followedUsers.push(follow.followed);
      });
    })
    .then(() => {
      Post.find({ "user.username": followedUsers })
        .sort({ createdAt: -1 })
        .then((data) => {
          data.forEach((post) => {
            posts.push(post);
          });
        })
        .then(() => {
          return res.json(posts);
        });
    });
};

export const explorePosts = (req, res) => {
  const posts = [];
  const publicUsers = [];

  User.find({ isPrivate: false })
    .then((users) => {
      users.forEach((user) => {
        publicUsers.push(user.username);
      });
    })
    .then(() => {
      Post.find({ "user.username": publicUsers })
        .sort({ createdAt: -1 })
        .then((data) => {
          data.forEach((post) => {
            posts.push(post);
          });
        })
        .then(() => {
          return res.json(posts);
        });
    });
};

export const getPostDetails = (req, res) => {
  const postId = req.params.id;
  const postData = {};

  Post.findOne({ _id: postId }).then((data) => {
    if (!data) {
      return res.status(404).json({ error: "Post not found" });
    } else {
      if (data.user.isPrivate) {
        const postOwner = data.user.username;
        const visiter = req.user.username;

        Follow.findOne({ follower: visiter, followed: postOwner }).then(
          (isFollow) => {
            if (isFollow) {
              data.visitCount += 1;
              data.save().then((post) => {
                postData.post = post;
                Comment.find({ post: postId })
                  .sort({ createdAt: -1 })
                  .then((data) => {
                    postData.comments = [];

                    if (data) {
                      data.forEach((comment) => {
                        postData.comments.push(comment);
                      });
                    }
                  })
                  .then(() => {
                    Like.find({ post: postId })
                      .sort({ createdAt: -1 })
                      .then((data) => {
                        postData.likes = [];

                        if (data.length > 0) {
                          data.forEach((like) => {
                            postData.likes.push(like);
                          });
                        }
                        return res.json(postData);
                      });
                  });
              });
            } else {
              return res.status(400).json({ error: "This profile hidden" });
            }
          }
        );
      } else {
        data.visitCount += 1;
        data.save().then((post) => {
          postData.post = post;
          Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .then((data) => {
              postData.comments = [];

              if (data) {
                data.forEach((comment) => {
                  postData.comments.push(comment);
                });
              }
            })
            .then(() => {
              Like.find({ post: postId })
                .sort({ createdAt: -1 })
                .then((data) => {
                  postData.likes = [];

                  if (data.length > 0) {
                    data.forEach((like) => {
                      postData.likes.push(like);
                    });
                  }
                  return res.json(postData);
                });
            });
        });
      }
    }
  });
};

export const createPost = (req, res) => {
  const postData = {
    body: req.body.body,
    tags: req.body.tags,
    images: req.body.images,
    user: req.user,
  };

  const newPost = new Post(postData);

  newPost
    .save()
    .then((doc) => {
      User.findOne({ username: req.user.username }).then((user) => {
        user.postCount += 1;
        user.save();
      });

      return res.status(201).json(doc);
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
};

export const updatePost = (req, res) => {
  const postId = req.params.id;
  const body = req.body.body;
  Post.findOne({ _id: postId }).then((data) => {
    if (!data) {
      return res.status(404).json({ error: "Post not found" });
    } else {
      if (data.user.username !== req.user.username) {
        return res.status(400).json({ error: "You cannot do this" });
      } else {
        data.body = body;
        data.save().then((doc) => {
          return res.json(doc);
        });
      }
    }
  });
};
export const deletePost = (req, res) => {
  const postId = req.params.id;

  Post.findOne({ _id: postId }).then((data) => {
    if (!data) {
      return res.status(404).json({ error: "Post not found" });
    } else {
      if (data.user.username !== req.user.username) {
        return res.status(400).json({ error: "You cannot do this" });
      } else {
        data
          .delete()
          .then(() => {
            Comment.find({ post: postId }).then((data) => {
              data.forEach((comment) => {
                comment.delete();
              });
            });
          })
          .then(() => {
            Like.find({ post: postId }).then((data) => {
              data.forEach((like) => {
                like.delete();
              });
            });
          })
          .then(() => {
            return res.json({ success: "Post deleted successfully" });
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }
    }
  });
};

export const likePost = (req, res) => {
  const postId = req.params.id;
  const likeData = {
    user: req.user,
    post: postId,
  };

  Post.findOne({ _id: postId }).then((post) => {
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    } else {
      Like.findOne({ post: postId, user: likeData.user }).then((like) => {
        if (like) {
          like.delete();
          post.likeCount -= 1;
          post.save().then((doc) => {
            return res.json(doc);
          });
        } else {
          const newLike = new Like(likeData);

          newLike.save().then(() => {
            post.likeCount += 1;
            post.save().then((doc) => {
              return res.json(doc);
            });
          });
        }
      });
    }
  });
};
