const express = require("express");
const router = express.Router();
const blogCtrl = require("../controller/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, isAdmin, blogCtrl.createBlog);
router.put("/:id", authMiddleware, isAdmin, blogCtrl.updateBlog);
router.get("/:id", blogCtrl.getBlog);
router.get("/", blogCtrl.getAllBlog);

module.exports = router;
