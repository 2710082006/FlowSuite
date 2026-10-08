const express = require("express");

const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
   getPreferences,
  updatePreferences,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post(
  "/reset-password/:token",
  resetPassword
);
router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);
router.put(
  "/change-password",
  protect,
  changePassword
);

router.get(
  "/preferences",
  protect,
  getPreferences
);

router.put(
  "/preferences",
  protect,
  updatePreferences
);
module.exports = router;