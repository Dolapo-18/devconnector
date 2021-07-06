const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const key = require("../../config/keys");
const auth = require("../../middleware/auth");

//@route     POST api/users/register
//@desc      Register User
//@access    Public
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const { name, email, password } = req.body;
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).send({ errors: [{ msg: "User already exists" }] });
      }
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //rating
        d: "mm", //default icon
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password,
      });
      const token = await newUser.generateAuthToken();

      await newUser.save();
      res.status(200).send({ newUser, token, msg: "Registration Successful!" });
    } catch (error) {
      res.status(401);
    }
  }
);

//@route     POST api/users/login
//@desc      Login User / Return JWT token
//@access    Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const user = await User.findByCredentials(
        req.body.email,
        req.body.password
      );

      const token = await user.generateAuthToken();

      if (!user) {
        res.status(404).send({ errors: [{ msg: "Unable to login!" }] });
      }

      res.send({ user, token });
    } catch (errors) {
      res.status(500).send({ errors: "Server Error" });
    }
  }
);

// router.get("/me", auth, async (req, res) => {
//   res.send(req.user);
// });

module.exports = router;
