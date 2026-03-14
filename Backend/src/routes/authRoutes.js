const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
  verifyOTP,
  resendOTP,
  updateUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, upload.single("avatar"), updateUserProfile);

router.get("/users", protect, getUsers);

module.exports = router;
