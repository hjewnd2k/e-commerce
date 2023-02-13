const express = require("express");
const productCtrl = require("../controller/productCtrl");
const router = express.Router();
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, isAdmin, productCtrl.createProduct);
router.get("/:id", productCtrl.getAProduct);
router.put("/:id", authMiddleware, isAdmin, productCtrl.updateProduct);
router.delete("/:id", authMiddleware, isAdmin, productCtrl.deleteProduct);
router.get("/", productCtrl.getAllProduct);

module.exports = router;
