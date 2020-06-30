const express = require("express");
const fileUpload = require('../middleware/file-upload');

const {
  getUsers,
  signUp,
  login,
} = require("../controllers/user-controllers");

const Router = express.Router();

Router.get("/", getUsers);

Router.post("/signup", fileUpload.single('image'), signUp);

Router.post("/login", login);

module.exports = Router;
