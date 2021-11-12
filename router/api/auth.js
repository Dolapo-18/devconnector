const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    //console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route POST <api />
//@desc Authenticate user and get token
//@access Public
router.post(
  "/",

  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").not().isEmpty(),
  ],
  async (req, res) => {
    
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      // const user = await User.findByCredentials(
      //   req.body.email,
      //   req.body.password
      // );

      // if (!user) {
      //   return res
      //     .status(400)
      //     .send({ errors: [{ msg: "Invalid Credentials" }] });
      // }
      const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const token = await user.generateAuthToken();

      res.send({ token });
    } catch (errors) {
      res.status(500).send({ errors: "Server Errors" });
    }
  
  });

module.exports = router;
