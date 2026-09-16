// routes/userRoutes.js
const express = require("express");
const router = express.Router();

// ✅ ডেস্ট্রাকচার করে ইমপোর্ট করুন
const {
  register,
  login,
  profile,
  logout,
  updateProfile,
  changePassword,
  refreshToken,
} = require("../controllers/userController");

// ✅ এখানে { protect } দিয়ে ইমপোর্ট করুন
const { protect } = require("../middleware/authMiddleware");

// ✅ isUser ঠিক আছে
const { isUser } = require("../middleware/roleMiddleware");

// ✅ Public Routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// ✅ Protected Routes
router.get("/profile", protect, isUser, profile);
router.put("/profile", protect, isUser, updateProfile);
router.post("/logout", protect, isUser, logout);
router.put("/change-password", protect, isUser, changePassword);

module.exports = router;