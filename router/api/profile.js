const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

//@route    GET api/profile/me
//@desc     Get current user profile
//@access   private
router.get("/me", auth, async (req, res) => {
  try {
    //console.log(req.user);
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(404).send({ msg: "No profile for this user" });
    }

    res.send({ profile, name: req.user.name, avatar: req.user.avatar });
  } catch (error) {
    res.send({ error: "Server Error" });
  }
});

//@route    POST api/profile
//@desc     Create or Update user profile
//@access   private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    //get user input
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //Build profile object
    const profileFields = {};
    //set user id to profile
    profileFields.user = req.user.id;
    //console.log(req.user);

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      //if profile already exist, then update
      if (profile) {
        //update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.send(profile);
      }

      // //if profile doesnt exist yet, then create new
      profile = new Profile(profileFields);
      await profile.save();

      res.status(200).send(profile);
    } catch (err) {
      res.status(500).send({ err: "Server Error" });
    }
  }
);

//@route    GET /api/profile
//@desc     retrieve all profiles
//@access   private
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    if (profiles) res.send(profiles);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

//@route    GET api/profile/user/:user_id
//@desc     retrieve profile via user ID
//@access   private
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile)
      return res.status(404).send({ msg: "No profile found for this user" });

    res.send(profile);
  } catch (err) {
    res.status(500).send({ err: "Server Error" });
  }
});

module.exports = router;
