const AdoptionPet = require("../models/AdoptionPet");
const AdoptionRequest = require("../models/AdoptionRequest");
const cloudinary = require("../config/cloudinaryConfig");

// @desc    Create new adoption listing
// @route   POST /api/adoptions/pets
// @access  Private (NGO/Shelter/Admin)
exports.createAdoptionPet = async (req, res) => {
  try {
    const {
      name,
      type,
      breed,
      age,
      gender,
      description,
      healthStatus,
      vaccinationStatus,
      personality,
      location,
    } = req.body;

    let imageUrl =
      "https://images.unsplash.com/photo-1543466835-00a732f21d52?q=80&w=400"; // Placeholder

    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "adoption_pets" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          },
        );
        uploadStream.end(req.file.buffer);
      });
    }

    const pet = await AdoptionPet.create({
      shelter: req.user._id,
      name,
      type,
      breed,
      age,
      gender,
      description,
      healthStatus,
      vaccinationStatus,
      personality,
      location,
      image: imageUrl,
    });

    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all available adoption pets
// @route   GET /api/adoptions/pets
// @access  Public
exports.getAdoptionPets = async (req, res) => {
  try {
    const { breed, type, location } = req.query;
    let query = { status: "available" };

    if (breed) query.breed = new RegExp(breed, "i");
    if (type) query.type = type;
    if (location) query.location = new RegExp(location, "i");

    const pets = await AdoptionPet.find(query).populate(
      "shelter",
      "name email clinicName avatar",
    );
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single adoption pet detail
// @route   GET /api/adoptions/pets/:id
// @access  Public
exports.getAdoptionPetById = async (req, res) => {
  try {
    const pet = await AdoptionPet.findById(req.params.id).populate(
      "shelter",
      "name email clinicName avatar phone address",
    );
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit adoption request
// @route   POST /api/adoptions/request
// @access  Private
exports.submitAdoptionRequest = async (req, res) => {
  try {
    const { petId, fullName, phone, address, experience, reason } = req.body;

    const pet = await AdoptionPet.findById(petId);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const request = await AdoptionRequest.create({
      pet: petId,
      adopter: req.user._id,
      fullName,
      phone,
      address,
      experience,
      reason,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get adoption requests (User or Shelter)
// @route   GET /api/adoptions/requests
// @access  Private
exports.getAdoptionRequests = async (req, res) => {
  try {
    let requests;
    if (
      req.user.role === "ngo" ||
      req.user.role === "admin" ||
      req.user.role === "store"
    ) {
      // NGOs see requests for their pets
      const pets = await AdoptionPet.find({ shelter: req.user._id }).select(
        "_id",
      );
      const petIds = pets.map((p) => p._id);
      requests = await AdoptionRequest.find({ pet: { $in: petIds } })
        .populate("pet")
        .populate("adopter", "name email avatar");
    } else {
      // Regular users see their own requests
      requests = await AdoptionRequest.find({ adopter: req.user._id })
        .populate("pet")
        .populate("pet.shelter", "name clinicName");
    }
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update adoption request status
// @route   PUT /api/adoptions/requests/:id
// @access  Private (NGO/Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, shelterMessage } = req.body;
    const request = await AdoptionRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status || request.status;
    request.shelterMessage = shelterMessage || request.shelterMessage;

    await request.save();

    // If approved, mark pet as pending or adopted
    if (status === "approved") {
      const pet = await AdoptionPet.findById(request.pet);
      if (pet) {
        pet.status = "adopted";
        await pet.save();
      }
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pets listed by current shelter
// @route   GET /api/adoptions/shelter/pets
// @access  Private (NGO/Admin)
exports.getShelterPets = async (req, res) => {
  try {
    const pets = await AdoptionPet.find({ shelter: req.user._id });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
