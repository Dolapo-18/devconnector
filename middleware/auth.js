const jwt = require("jsonwebtoken");
const User = require("../models/User");
const key = require("../config/keys");

const auth = async (req, res, next) => {
  try {
    //get user token
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, key.secret);

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }

    //store token & user in req
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please Authenticate" });
  }
};

module.exports = auth;
