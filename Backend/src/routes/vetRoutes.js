const express = require("express");
const router = express.Router();
const {
  getVets,
  getVetById,
  getNearbyVets,
} = require("../controllers/vetController");

router.get("/", getVets);
router.get("/nearby", getNearbyVets);
router.get("/:id", getVetById);

module.exports = router;
