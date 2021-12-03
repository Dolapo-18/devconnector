const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const request = require("request");

const key = require("../../config/keys");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");

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
    //console.log(profile)
    res.json(profile);
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
    if (!profile) return res.status(404).send({ msg: "Profile not found" });

    res.send(profile);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({ msg: "Profile not found" });
    }
    res.status(500).send({ err: "Server Error" });
  }
});

//@route    delete api/profile/
//@desc     delete profile, user & posts
//@access   private
router.delete("/", auth, async (req, res) => {
  try {
    //delete posts
    await Post.deleteMany({user: req.user.id})
    //delete profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //delete user
    await User.findOneAndRemove({ _id: req.user.id });

    res.status(200).send({ msg: "User deleted Successfully" });
  } catch (err) {
    res.status(404).send({ msg: "Profile not found" });
  }
});

//@route    PUT api/profile/experience
//@desc     Add profile experience
//@access   private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;
    const newExp = { title, company, location, from, to, current, description };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(404).send({ msg: "Profile not found" });
      }
      profile.experience.unshift(newExp);
      await profile.save();

      res.status(200).send(profile);
    } catch (error) {
      //console.log(error);
      res.status(400).send({ error: "Server Error" });
    }
  }
);

//@route    DELETE api/profile/experience/:exp_id
//@desc     Delete profile experience
//@access   private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.send({ msg: "Profile not found" });
    const indexToRemove = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(indexToRemove, 1);
    await profile.save();

    res.status(200).send(profile);
  } catch (error) {
    return res.status(400).send({ error: "Server Error" });
  }
});

//@route    PUT api/profile/education
//@desc     Add profile education
//@access   private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School/Bootcamp is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of Study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(404).send({ msg: "Profile not found" });
      }
      profile.education.unshift(newEdu);
      await profile.save();

      res.status(200).send(profile);
    } catch (error) {
      console.log(error);
      res.status(400).send({ error: "Server Error" });
    }
  }
);

//@route    DELETE api/profile/education/:edu_id
//@desc     Delete profile education
//@access   private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.send({ msg: "Profile not found" });
    const indexToRemove = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(indexToRemove, 1);
    await profile.save();

    res.status(200).send(profile);
  } catch (error) {
    return res.status(400).send({ error: "Server Error" });
  }
});

//@route    GET api/profile/github/:username
//@desc     get user repos from github
//@access   Public
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${key.githubClientID}&client_secret=${key.githubClientSecret}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.log(error);

      if (response.statusCode !== 200) {
        return res.status(404).send({ msg: "No github profile found!" });
      }
      res.send(JSON.parse(body));
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
