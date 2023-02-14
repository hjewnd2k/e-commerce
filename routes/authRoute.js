const express = require("express");
const authController = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", authController.createUser);
router.post("/forgot-password-token", authController.forgotPasswordToken);
router.put("/password", authMiddleware, authController.updatePassword);
router.post("/login", authController.loginUserCtrl);
router.get("/all-users", authMiddleware, isAdmin, authController.getAllUser);
router.get("/refresh", authController.handleRefreshToken);
router.get("/logout", authController.logout);
router.get("/:id", authMiddleware, isAdmin, authController.getAUser);
router.delete("/:id", authMiddleware, isAdmin, authController.deleteAUser);
router.put("/edit-user", authMiddleware, authController.updateAUser);
router.put(
  "/block-user/:id",
  authMiddleware,
  isAdmin,
  authController.blockUser
);
router.put(
  "/unblock-user/:id",
  authMiddleware,
  isAdmin,
  authController.unblockUser
);

module.exports = router;
