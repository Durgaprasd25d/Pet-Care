const User = require("../models/User");
const deg2rad = (deg) => deg * (Math.PI / 180);

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// @desc    Get all vets
// @route   GET /api/vets
// @access  Public
exports.getVets = async (req, res) => {
  try {
    const vets = await User.find({ role: "vet" }).select("-password");
    // Map User to Vet format if necessary (though fields mostly match now)
    const formattedVets = vets.map((vet) => ({
      _id: vet._id,
      name: vet.name,
      specialty: vet.specialty,
      rating: vet.rating,
      reviews: vet.reviews,
      image:
        vet.avatar ||
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
      clinicName: vet.clinicName,
      distance: "2.5 km", // Default/Mock distance
      about: vet.about,
      address: vet.address,
      contactNumber: vet.phone,
      latitude: vet.coordinates?.latitude,
      longitude: vet.coordinates?.longitude,
    }));
    res.json(formattedVets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby vets
// @route   GET /api/vets/nearby
// @access  Public
exports.getNearbyVets = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "Location coordinates are required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const vets = await User.find({ role: "vet" }).select("-password");

    const nearbyVets = vets
      .map((vet) => {
        let distance = null;
        if (
          vet.coordinates &&
          vet.coordinates.latitude &&
          vet.coordinates.longitude
        ) {
          distance = getDistance(
            userLat,
            userLng,
            vet.coordinates.latitude,
            vet.coordinates.longitude,
          );
        }

        return {
          _id: vet._id,
          name: vet.name,
          specialty: vet.specialty,
          rating: vet.rating,
          reviews: vet.reviews,
          image:
            vet.avatar ||
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
          clinicName: vet.clinicName,
          distance: distance ? `${distance.toFixed(1)} km` : "Unknown",
          distanceVal: distance || Infinity, // For sorting
          about: vet.about,
          address: vet.address,
          contactNumber: vet.phone,
          latitude: vet.coordinates?.latitude,
          longitude: vet.coordinates?.longitude,
          emergencyAvailable: true, // Always true for this feature context
        };
      })
      .sort((a, b) => a.distanceVal - b.distanceVal);

    res.json(nearbyVets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vet by ID
// @route   GET /api/vets/:id
// @access  Public
exports.getVetById = async (req, res) => {
  try {
    const vet = await User.findOne({ _id: req.params.id, role: "vet" }).select(
      "-password",
    );
    if (vet) {
      const formattedVet = {
        _id: vet._id,
        name: vet.name,
        specialty: vet.specialty,
        rating: vet.rating,
        reviews: vet.reviews,
        image:
          vet.avatar ||
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
        clinicName: vet.clinicName,
        distance: "2.5 km",
        about: vet.about,
        address: vet.address,
        phone: vet.phone,
        latitude: vet.coordinates?.latitude,
        longitude: vet.coordinates?.longitude,
      };
      res.json(formattedVet);
    } else {
      res.status(404).json({ message: "Vet not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
