const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const key = require("../config/keys");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

// //lets mongoose determine how User schema is related to Task schema
// userSchema.virtual("myprofiles", {
//   ref: "Profile",
//   localField: "_id",
//   foreignField: "user",
// });

//Hiding private data by manipulating the user object
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

//generate token
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  //the sign method requires a payload that uniquely identifies our user and a secret key
  const token = await jwt.sign(
    { _id: user._id.toString(), name: user.name.toString() },
    key.secret,
    { expiresIn: 3600 }
  );

  //add the token generated above to the user property "tokens" - an array
  //we concatenate the token generated to the user token object
  user.tokens = user.tokens.concat({ token: token });
  //console.log(token);
  //save to DB
  await user.save();

  return token;
};

//the "statics" keyword allows this method be applicable to models
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};
//hash plain password before saving user to DB
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("user", userSchema);

module.exports = User;
