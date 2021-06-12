const express = require("express");
const router = express.Router();

router.get("/profile", (req, res) => {
  res.json({
    msg: "From Profile router",
  });
});

module.exports = router;
