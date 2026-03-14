const LostPet = require("../models/LostPet");
const Post = require("../models/Post");
const cloudinary = require("../config/cloudinaryConfig");

// @desc    Report lost/found pet
// @route   POST /api/lostpets
// @access  Private
exports.reportLostPet = async (req, res) => {
  try {
    let {
      type,
      petName,
      breed,
      color,
      lastSeenLocation,
      lastSeenDate,
      description,
      image,
      contactInfo,
    } = req.body;

    // Handle contactInfo if it comes as a string from FormData
    if (typeof contactInfo === "string") {
      try {
        contactInfo = JSON.parse(contactInfo);
      } catch (e) {
        console.error("Failed to parse contactInfo:", e);
      }
    }

    let imageUrl = image || "";

    // Handle image upload to Cloudinary if a file was uploaded via multer
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "lost_found_pets" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          },
        );
        uploadStream.end(req.file.buffer);
      });
    }

    const lostPet = await LostPet.create({
      type,
      petName,
      breed,
      color,
      lastSeenLocation,
      lastSeenDate,
      description,
      image: imageUrl,
      reportedBy: req.user._id,
      contactInfo,
    });

    // Automatically create a community post
    try {
      const typeText = type === "lost" ? "LOST" : "FOUND";
      const petText = petName ? `${petName}` : "a pet";
      await Post.create({
        user: req.user._id,
        content: `🚨 ${typeText} PET ALERT! 🚨\n\nI ${type === "lost" ? "lost" : "found"} ${petText} at ${lastSeenLocation} on ${new Date(lastSeenDate).toLocaleDateString()}.\n\nDescription: ${description}`,
        images: [imageUrl],
        category: "lost_found",
        lostPetId: lostPet._id,
        location: lastSeenLocation,
      });
    } catch (postError) {
      console.error("Failed to create community post for lost pet:", postError);
    }

    res.status(201).json(lostPet);
  } catch (error) {
    console.error("Error in reportLostPet:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all lost/found pets
// @route   GET /api/lostpets
// @access  Public
exports.getLostPets = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { status: "active" };
    if (type) filter.type = type;

    const lostPets = await LostPet.find(filter)
      .populate("reportedBy", "name email avatar")
      .sort({ lastSeenDate: -1 });

    res.json(lostPets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lost pet details
// @route   GET /api/lostpets/:id
// @access  Public
exports.getLostPetById = async (req, res) => {
  try {
    const lostPet = await LostPet.findById(req.params.id).populate(
      "reportedBy",
      "name avatar",
    );
    if (!lostPet) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(lostPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lost pet status
// @route   PUT /api/lostpets/:id
// @access  Private
exports.updateLostPetStatus = async (req, res) => {
  try {
    const lostPet = await LostPet.findById(req.params.id);
    if (!lostPet) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (
      lostPet.reportedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "ngo"
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    lostPet.status = req.body.status || lostPet.status;
    await lostPet.save();

    res.json(lostPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
