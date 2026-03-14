const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

router.get("/stats", protect, adminController.getStats);
router.get("/vet-stats", protect, adminController.getVetStats);
router.get("/ngo-stats", protect, adminController.getNgoStats);
router.get("/store-stats", protect, adminController.getStoreStats);

module.exports = router;
