const express = require("express");
const router = express.Router();

//@route     GET api/posts/posts
//@desc      Test post route
//@access    Public
router.get("/posts", (req, res) => {
  res.json({
    msg: "From Posts router",
  });
});

module.exports = router;
