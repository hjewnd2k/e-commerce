const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const createUser = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser) {
    throw new Error("User Already Exists");
  }
  const newUser = await User.create(req.body);
  delete newUser._doc.password;

  res.json(newUser);
});

module.exports = {
  createUser,
};
