const express = require("express");
const router = express.Router();

router.get("/users", (req, res) => {
  res.json({
    msg: "From Users router",
  });
});

module.exports = router;
