const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createAdoptionPet,
  getAdoptionPets,
  getAdoptionPetById,
  submitAdoptionRequest,
  getAdoptionRequests,
  updateRequestStatus,
  getShelterPets,
} = require("../controllers/adoptionController");
const { protect } = require("../middleware/authMiddleware");

// Pet listings
router
  .route("/pets")
  .get(getAdoptionPets)
  .post(protect, upload.single("image"), createAdoptionPet);
router.get("/pets/:id", getAdoptionPetById);
router.get("/shelter/pets", protect, getShelterPets);

// Adoption requests
router
  .route("/requests")
  .get(protect, getAdoptionRequests)
  .post(protect, submitAdoptionRequest);
router.put("/requests/:id", protect, updateRequestStatus);

module.exports = router;
