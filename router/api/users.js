const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");
const key = require("../../config/keys");
const auth = require("../../middleware/auth");

//load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//@route     POST /register
//@desc      Register User
//@access    Public
router.post("/register", async (req, res) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);
    //check validation
    if (!isValid) {
      return res.status(400).send(errors);
    }
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      errors.email = "Email already exists";
      res.status(400).send({ errors });
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
});

//@route     POST /login
//@desc      Login User / Return JWT token
//@access    Public
router.post("/login", async (req, res) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);
    //check validation
    if (!isValid) {
      return res.status(400).send(errors);
    }

    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();

    if (!user) {
      errors.email = "User not found";
      res.status(404).send({ errors });
    }

    res.send({ user, token });
  } catch (errors) {
    res.status(400).send({ errors: "Unable to login" });
  }
});

// router.get("/me", auth, async (req, res) => {
//   res.send(req.user);
// });

module.exports = router;
