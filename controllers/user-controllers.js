const User = require("../models/User");
const HttpError = require("../models/http-error");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "--password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
    console.log(existingUser)
  } catch (err) {
    const error = new HttpError("Sign up failed, please try again later", 500);
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      401
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
    console.log(isValidPassword);
  } catch (err) {
      const error = new HttpError(
        'Could not log you in, server error, try again after some time',
          500
      )
      return next(error);
  }

  if(!isValidPassword){
      const error = new HttpError(
          'Invalid password!',
          400
      )
      return next(error);
  }

  let token;
  try {
    token = jwt.sign(
        {userId: existingUser.id},
        'loggedIn_dont_share',
        {expiresIn: '1h'}
    )   
  } catch (error) {
     const err = new HttpError(
         'SignUp failed',
         500
     ) 
     return next(err);
  }

  // res.json({user: createUser.toObject({getters:true})})
  res.json({ userId: existingUser.id, token: token });
};

exports.signUp = async (req, res, next) => {
  const { name, email, password } = req.body;

  console.log(req.body);

  console.log("Data received");
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later",
      500
    );
    console.error(error);
  }

  console.log(existingUser);

  if (existingUser) {
    console.log(Object.keys(existingUser));
    const error = new HttpError(
      "User with that email already exists, please try again with another email",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }

  const createUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createUser.save();
  } catch (err) {
    console.error(err);
    return next(err);
  }

  try {
    await createUser.save();
  } catch (err) {
    const error = new HttpError(
      "Creating user failed please try again later",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
        {userId: createUser.id},
        'loggedIn_dont_share',
        {expiresIn: '1h'}
    )   
  } catch (error) {
     const err = new HttpError(
         'SignUp failed',
         500
     ) 
     return next(err);
  }

  // res.json({user: createUser.toObject({getters:true})})
  res.json({ userId: createUser.id, token: token });
};
