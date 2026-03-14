const express = require("express");
const router = express.Router();
const {
  reportLostPet,
  getLostPets,
  getLostPetById,
  updateLostPetStatus,
} = require("../controllers/lostPetController");
const { protect } = require("../middleware/authMiddleware");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .get(getLostPets)
  .post(protect, upload.single("image"), reportLostPet);

router.route("/:id").get(getLostPetById).put(protect, updateLostPetStatus);

module.exports = router;
