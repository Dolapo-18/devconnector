const express = require("express");
const mongoose = require("mongoose");

const userRouter = require("./router/api/users");
const profileRouter = require("./router/api/profile");
const postRouter = require("./router/api/posts");

const app = express();

//DB Config
const db = require("./config/keys").mongodbURI;

const port = process.env.PORT || 5000;

//Connect to MongoDB
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

//use Routes
app.use(userRouter);
app.use(profileRouter);
app.use(postRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
