const express = require("express");
const router = express.Router();

const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");

const key = require("../../config/keys");
const auth = require("../../middleware/auth");

//@route     POST api/posts
//@desc      Create a post
//@access    Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).send({ errors: errors.array() });

    const user = await User.findById(req.user.id).select("-password");
    try {
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.status(200).send(post);
    } catch (error) {
      //console.log(error);
      res.status(500).send("Server Error");
    }
  }
);

//@route     GET api/posts
//@desc      Get all posts
//@access    Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).send(posts);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

//@route     GET api/posts/:post_id
//@desc      Get a post by ID
//@access    Private
router.get("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).send({ msg: "No post found!" });
    }
    res.status(200).send(post);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).send({ msg: "No post found!" });
    }
    res.status(500).send("Server Error");
  }
});

//@route     DELETE api/posts/:post_id
//@desc      Delete a post by ID
//@access    Private
router.delete("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).send({ msg: "No post found!" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).send({ msg: "User not authorized" });
    }
    await post.remove();
    res.status(200).send({ msg: "Post removed" });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).send({ msg: "No post found!" });
    }
    res.status(500).send("Server Error");
  }
});

//@route     PUT api/posts/like/:post_id
//@desc      Like a post by ID
//@access    Private
router.put("/like/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    //check if post has already been liked by logged in user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).send({ msg: "Post already liked!" });
    }

    //else insert user ID object into likes array
    post.likes.unshift({ user: req.user.id });
    await post.save();

    res.status(200).send(post.likes);
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId") {
      return res.status(404).send({ msg: "No post found!" });
    }
    res.status(500).send({ msg: "Server Error" });
  }
});

//@route     DELETE api/posts/unlike/:post_id
//@desc      Unlike a post by ID
//@access    Private
router.put("/unlike/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    //check if post has already been liked by logged in user, else unlike it
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).send({ msg: "Post has not been liked!" });
    }

    //else remove user ID object from likes array
    const indexToRemove = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(indexToRemove, 1);
    await post.save();

    res.status(200).send(post.likes);
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId") {
      return res.status(404).send({ msg: "No post found!" });
    }
    res.status(500).send({ msg: "Server Error" });
  }
});

//@route     POST api/posts/comment/:post_id
//@desc      Make a comment to a post
//@access    Private
router.post(
  "/comment/:post_id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).send({ errors: errors.array() });

    const user = await User.findById(req.user.id).select("-password");
    const post = await Post.findById(req.params.post_id);

    try {
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();
      res.status(200).send(post.comments);
    } catch (error) {
      //console.log(error);
      if (error.kind === "ObjectId") {
        return res.status(404).send({ msg: "No post found!" });
      }
      res.status(500).send("Server Error");
    }
  }
);

//@route     DELETE api/posts/comment/:post_id/:comment_id
//@desc      Delete a comment by its post ID
//@access    Private
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    //find comment to be deleted by its post
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    if (!comment) return res.status(400).send({ msg: "Comment not found!" });

    //check if comment belongs to logged in user, then delete
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .send({ msg: "Not authorized to delete this post!" });
    }
    //index to remove
    const indexToRemove = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(indexToRemove, 1);

    await post.save();
    res.status(200).send(post.comments);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).send({ msg: "No post found!" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
