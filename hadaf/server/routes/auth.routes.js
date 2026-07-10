const express = require("express");
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);

router.get("/verify/:token", authController.verifyEmail);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/exchangeResetToken", authController.exchangeResetToken);
router.post("/resetPassword", authController.resetPassword);
router.patch("/updatePassword", protect, authController.updatePassword);

module.exports = router;
