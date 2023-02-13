const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  if (!req?.headers?.authorization?.startsWith("Bearer")) {
    throw new Error("There is no token attached to headers");
  }
  const token = req.headers.authorization.split(" ")[1];
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded?.id);
      req.user = user;
      next();
    }
  } catch (error) {
    throw new Error("Not authorized token expired, Please Login again");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new Error("You are not an admin");
  }
  next();
});

module.exports = { authMiddleware, isAdmin };
