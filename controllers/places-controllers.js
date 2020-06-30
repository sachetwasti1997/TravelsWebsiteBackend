const Place = require("../models/place");
const User = require("../models/User");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const fs = require('fs');

exports.getPlacesById = async (req, res, next) => {
  console.log("GET request in places");
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(mongoose.Types.ObjectId(placeId));
  } catch (err) {
    console.log(err);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  console.log(userId);
  let userwithplaces;
  try {
    userwithplaces = await User.findOne(mongoose.Types.ObjectId(userId)).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later "+err,
      500
    );
    return next(error);
  }

  if (!userwithplaces || userwithplaces.length === 0) {
    return next("Could not find places with the provided user id", 404);
  }

  console.log(userwithplaces.places);

  const placesList = userwithplaces.places.map((place) =>
    place.toObject({ getters: true })
  );
  res.json({ placesList });
};

exports.addPlace = async (req, res, next) => {
  // console.log(req);
  const { title, description, address, creator } = req.body;

  const createdPlace = new Place({
    title,
    description,
    image: req.file.path,
    address,
    creator,
  });
  console.log(createdPlace);

  let user;
  try {
    user = await User.findById(mongoose.Types.ObjectId(creator));
  } catch (err) {
    const error = new HttpError("Creating place failed please try again "+err, 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("creating places failed "+err, 500);
    return next(error);
  }
  res.json({ place: createdPlace });
};

exports.updatePlace = async (req, res, next) => {
  const { title, description, address } = req.body;
  const placeId = req.params.pid;
  let place;
  console.log(req.body);
  console.log(placeId);
  try {
    place = await Place.findById(mongoose.Types.ObjectId(placeId));
  } catch (err) {
    console.log(err);
    return next(err);
  }

  place.title = title;
  place.description = description;
  place.address = address;

  try {
    await place.save();
  } catch (err) {
    console.error(err);
    return next(err);
  }
  res.json({ updatedPlace: place });
};

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  console.log(placeId, "To be deleted");
  let place;
  try {
    place = await Place.findById(mongoose.Types.ObjectId(placeId)).populate(
      "creator"
    ); /*specify the feild that relates the places and user, populate gives the whole user object related to that place**/
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete the place "+err,
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Could not delete the place "+err, 500);
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  })

  res.json({message: 'Everything went well!'})

};
/** E sanu maa khanthim, ya I don't remember but I guess, we used to eat such choclates*/
