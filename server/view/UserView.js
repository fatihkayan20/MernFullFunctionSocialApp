import Post from "../model/PostModel.js";
import Comment from "../model/CommentModel.js";
import Like from "../model/LikeModel.js";
import Follow from "../model/FollowModel.js";
import User from "../model/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

export const signupUser = (req, res) => {
  const userData = {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    password2: req.body.password2,
    image: req.body.image,
  };
  let errors = {};

  if (validator.isEmpty(userData.email)) {
    errors.email = "Email is required";
  } else if (!validator.isEmail(userData.email)) {
    errors.email = "Email is badly formatted";
  }
  if (validator.isEmpty(userData.username)) {
    errors.username = "Username is required";
  }
  if (validator.isEmpty(userData.password)) {
    errors.password = "Password is required";
  } else if (userData.password !== userData.password2) {
    errors.confirmPassword = "Passwords must match";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  } else {
    User.findOne({ email: userData.email })
      .then((doc) => {
        if (doc) {
          errors.email = "Email is already taken";
        }
      })
      .then(() => {
        User.findOne({ username: userData.username })
          .then((doc) => {
            if (doc) {
              errors.username = "Username is already taken";
            }
          })
          .then(() => {
            if (Object.keys(errors).length > 0) {
              return res.status(400).json(errors);
            }

            const newUser = new User(userData);

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(userData.password, salt, (err, hash) => {
                if (err) return res.status(400).json(err);
                newUser.password = hash;

                newUser.save().then((user) => {
                  jwt.sign(
                    {
                      id: user.id,
                      username: user.username,
                      image: user.image,
                      isPrivate: user.isPrivate,
                    },
                    "sl_myJwtSecret",
                    (err, token) => {
                      if (err) return res.status(400).json(err);

                      return res.status(201).json({
                        user: {
                          id: user.id,
                          username: user.username,
                          image: user.image,
                          isPrivate: user.isPrivate,
                        },
                        token: token,
                      });
                    }
                  );
                });
              });
            });
          });
      });
  }
};

export const loginUser = (req, res) => {
  const userData = {
    usernameOrEmail: req.body.usernameOrEmail,
    password: req.body.password,
  };
  let errors = {};

  if (validator.isEmpty(userData.usernameOrEmail)) {
    errors.usernameOrEmail = "Username or email is required";
  }
  if (validator.isEmpty(userData.password)) {
    errors.password = "Password is required";
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  } else {
    User.findOne({ username: userData.usernameOrEmail }).then((username) => {
      if (!username) {
        User.findOne({ email: userData.usernameOrEmail }).then((email) => {
          if (!email) {
            errors.invalid = "Invalid login please try again";
          } else {
            bcrypt
              .compare(userData.password, email.password)
              .then((isMatch) => {
                if (!isMatch) {
                  errors.invalid = "Invalid login please try again";
                }

                if (Object.keys(errors).length > 0) {
                  return res.status(400).json(errors);
                } else {
                  jwt.sign(
                    {
                      id: email.id,
                      username: email.username,
                      image: email.image,
                      isPrivate: email.isPrivate,
                    },
                    "sl_myJwtSecret",
                    (err, token) => {
                      if (err) return res.status(400).json(err);

                      return res.status(200).json({
                        user: {
                          id: email.id,
                          username: email.username,
                          image: email.image,
                          isPrivate: email.isPrivate,
                        },
                        token: token,
                      });
                    }
                  );
                }
              });
          }
        });
      } else {
        bcrypt.compare(userData.password, username.password).then((isMatch) => {
          if (!isMatch) {
            errors.invalid = "Invalid login please try again";
          }
          if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
          } else {
            jwt.sign(
              {
                id: username.id,
                username: username.username,
                image: username.image,
                isPrivate: username.isPrivate,
              },
              "sl_myJwtSecret",
              (err, token) => {
                if (err) return res.status(400).json(err);

                return res.status(200).json({
                  user: {
                    id: username.id,
                    username: username.username,
                    image: username.image,
                    isPrivate: username.isPrivate,
                  },
                  token: token,
                });
              }
            );
          }
        });
      }
    });
  }
};

export const getOwnUserDetails = (req, res) => {
  const userData = {};
  User.findOne({ username: req.user.username }).then((user) => {
    if (!user) {
      return res.status(500).json({ error: "Something went wrong..." });
    } else {
      userData.user = user;

      Like.find({ "user.username": req.user.username })
        .then((likes) => {
          userData.likes = [];
          if (likes.length > 0) {
            likes.forEach((like) => {
              userData.likes.push(like);
            });
          }
        })
        .then(() => {
          Post.find({ "user.username": req.user.username })
            .then((posts) => {
              userData.posts = [];
              if (posts.length > 0) {
                posts.forEach((post) => {
                  userData.posts.push(post);
                });
              }
            })
            .then(() => {
              return res.json(userData);
            });
        });
    }
  });
};
export const getUserDetails = (req, res) => {
  const userId = req.params.id;
  const userData = {};

  User.findOne({ _id: userId }).then((user) => {
    if (!user) {
      return res.status(500).json({ error: "Something went wrong..." });
    } else {
      if (user.isPrivate) {
        Follow.findOne({
          follower: req.user.username,
          followed: user.username,
        }).then((isFollow) => {
          if (!isFollow) {
            return res.status(400).json({ error: "This profile is hidden" });
          } else {
            userData.user = user;

            Like.find({ "user.username": user.username })
              .then((likes) => {
                userData.likes = [];
                if (likes.length > 0) {
                  likes.forEach((like) => {
                    userData.likes.push(like);
                  });
                }
              })
              .then(() => {
                Post.find({ "user.username": user.username })
                  .then((posts) => {
                    userData.posts = [];
                    if (posts.length > 0) {
                      posts.forEach((post) => {
                        userData.posts.push(post);
                      });
                    }
                  })
                  .then(() => {
                    return res.json(userData);
                  });
              });
          }
        });
      } else {
        userData.user = user;

        Like.find({ "user.username": user.username })
          .then((likes) => {
            userData.likes = [];
            if (likes.length > 0) {
              likes.forEach((like) => {
                userData.likes.push(like);
              });
            }
          })
          .then(() => {
            Post.find({ "user.username": user.username })
              .then((posts) => {
                userData.posts = [];
                if (posts.length > 0) {
                  posts.forEach((post) => {
                    userData.posts.push(post);
                  });
                }
              })
              .then(() => {
                return res.json(userData);
              });
          });
      }
    }
  });
};

export const updateOwnUserDetails = (req, res) => {
  const newData = req.body;

  User.findOne({ username: req.user.username }).then((user) => {
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      if (req.body.image) {
        user.image = req.body.image;
      }
      if (req.body.bio) {
        user.bio = req.body.bio;
      }

      if (req.body.isPrivate !== null) {
        if (user.isPrivate !== req.body.isPrivate) {
          user.isPrivate = req.body.isPrivate;
          Post.updateMany(
            { "user.username": req.user.username },
            { $set: { "user.isPrivate": req.body.isPrivate } }
          ).then((a) => {
            console.log(a);
          });
        }
      }

      user.save().then((updatedUser) => {
        return res.json(updatedUser);
      });
    }
  });
};
