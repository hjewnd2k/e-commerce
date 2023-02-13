const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongodbid");
const jwt = require("jsonwebtoken");

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

const loginUserCtrl = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    throw new Error("User Not Found");
  }
  if (!(await findUser.isPasswordMatched(password))) {
    throw new Error("Incorrect account or password");
  }
  const refreshToken = await generateRefreshToken(findUser?._id);
  const updateUser = await User.findByIdAndUpdate(
    findUser?._id,
    {
      refreshToken,
    },
    { new: true }
  );
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 72 * 1000,
  });
  delete updateUser._doc.password;
  res.json({ ...updateUser._doc, token: generateToken(findUser?._id) });
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in Cookie");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id)
      throw new Error("There is something wrong with refresh token");
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in Cookie");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (user) {
    await User.findOneAndUpdate(refreshToken, {
      refreshToken: "",
    });
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.sendStatus(204);
});

const getAllUser = asyncHandler(async (req, res, next) => {
  try {
    const getUsers = await User.find({}, "-password");
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

const updateAUser = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

const getAUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const findUser = await User.findById(id, "-password");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteAUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    await User.findByIdAndDelete(id);
    res.json({ message: "delete user success" });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      { new: true }
    );
    res.json({
      message: "User Blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      { new: true }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getAllUser,
  getAUser,
  deleteAUser,
  updateAUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
};
