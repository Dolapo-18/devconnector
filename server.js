const express = require("express");
const mongoose = require("mongoose");
//const bodyParser = require("body-parser");

const userRouter = require("./router/api/users");
const profileRouter = require("./router/api/profile");
const postRouter = require("./router/api/posts");
const authRouter = require("./router/api/auth");

const app = express();

//bodyParser middleware
//app.use(express.urlencoded());
app.use(express.json());

//DB Config
const db = require("./config/keys").mongodbURI;

const port = process.env.PORT || 5000;

//Connect to MongoDB
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

//use Routes
app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/posts", postRouter);
app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
