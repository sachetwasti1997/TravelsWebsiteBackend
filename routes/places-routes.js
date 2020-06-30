const express = require("express");

const fileUpload = require('../middleware/placesImage');
const {
  getPlacesById,
  addPlace,
  updatePlace,
  deletePlace,
  getPlacesByUserId,
} = require("../controllers/places-controllers");
const checkauth = require('../middleware/check-auth');

const Router = express.Router();

Router.get("/:pid", getPlacesById);

Router.get("/user/:uid", getPlacesByUserId);

Router.use(checkauth);

Router.patch("/:pid", updatePlace)

Router.post("/", fileUpload.single('image'), addPlace);

Router.delete("/:pid", deletePlace)

module.exports = Router;
