const Pet = require("../models/Pet");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Vaccination = require("../models/Vaccination");
const MedicalRecord = require("../models/MedicalRecord");
const cloudinary = require("../config/cloudinaryConfig");

// @desc    Get pet medical history (Aggregated)
// @route   GET /api/pets/:id/history
// @access  Private
exports.getPetHistory = async (req, res) => {
  try {
    const petId = req.params.id;

    // Fetch all related data
    const [appointments, prescriptions, vaccinations, medicalRecords] =
      await Promise.all([
        Appointment.find({ petId }).populate(
          "vetId",
          "name clinicName specialty",
        ),
        Prescription.find({ petId }).populate(
          "vetId",
          "name clinicName specialty",
        ),
        Vaccination.find({ petId }),
        MedicalRecord.find({ petId }).populate(
          "vetId",
          "name clinicName specialty",
        ),
      ]);

    // Map and normalize records
    const history = [
      ...appointments.map((a) => ({
        _id: a._id,
        type: "appointment",
        date: a.date,
        time: a.time,
        title: `Clinical Visit: ${a.reason}`,
        vet: a.vetId?.name,
        clinic: a.vetId?.clinicName,
        status: a.status,
      })),
      ...prescriptions.map((p) => ({
        _id: p._id,
        type: "prescription",
        date: p.date,
        title: "Medical Prescription",
        vet: p.vetId?.name,
        clinic: p.vetId?.clinicName,
        medicines: p.medicines,
        instructions: p.instructions,
      })),
      ...vaccinations.map((v) => ({
        _id: v._id,
        type: "vaccination",
        date: v.dateAdministered,
        title: `Vaccination: ${v.vaccineType}`,
        vet: v.vetName,
        notes: v.notes,
        nextDue: v.nextDueDate,
      })),
      ...medicalRecords.map((m) => ({
        _id: m._id,
        type: "medical_record",
        date: m.recordDate,
        title: `Diagnosis: ${m.diagnosis}`,
        medication: m.medication,
        notes: m.notes,
        vet: m.vetId?.name,
        clinic: m.vetId?.clinicName,
        documentUrl: m.documentUrl,
      })),
    ];

    // Sort by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pets
// @route   GET /api/pets
// @access  Private
exports.getPets = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "admin") {
      query = {};
    } else if (req.user.role === "vet") {
      // Find IDs of pets that have appointments with this vet
      const appointments = await Appointment.find({
        vetId: req.user._id,
      }).distinct("petId");
      query = { _id: { $in: appointments } };
    } else {
      query = { ownerId: req.user._id };
    }

    const pets = await Pet.find(query).populate("ownerId", "name email phone");
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pet by ID
// @route   GET /api/pets/:id
// @access  Private
exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (
      pet &&
      (pet.ownerId.toString() === req.user._id.toString() ||
        req.user.role === "admin")
    ) {
      res.json(pet);
    } else {
      res.status(404).json({ message: "Pet not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new pet
// @route   POST /api/pets
// @access  Private
exports.createPet = async (req, res) => {
  const { name, type, breed, age, weight, gender, image } = req.body;

  try {
    let imageUrl = image || "";

    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "pet_profiles" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          },
        );
        uploadStream.end(req.file.buffer);
      });
    }

    const pet = new Pet({
      ownerId: req.user._id,
      name,
      type,
      breed,
      age,
      weight,
      gender,
      image: imageUrl,
    });

    const createdPet = await pet.save();
    res.status(201).json(createdPet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a pet
// @route   PUT /api/pets/:id
// @access  Private
exports.updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (
      pet &&
      (pet.ownerId.toString() === req.user._id.toString() ||
        req.user.role === "admin")
    ) {
      pet.name = req.body.name ?? pet.name;
      pet.type = req.body.type ?? pet.type;
      pet.breed = req.body.breed ?? pet.breed;
      pet.age = req.body.age ?? pet.age;
      pet.weight = req.body.weight ?? pet.weight;
      pet.gender = req.body.gender ?? pet.gender;

      if (req.file) {
        pet.image = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "pet_profiles" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            },
          );
          uploadStream.end(req.file.buffer);
        });
      } else if (req.body.image) {
        pet.image = req.body.image;
      }

      const updatedPet = await pet.save();
      res.json(updatedPet);
    } else {
      res.status(404).json({ message: "Pet not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a pet
// @route   DELETE /api/pets/:id
// @access  Private
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (
      pet &&
      (pet.ownerId.toString() === req.user._id.toString() ||
        req.user.role === "admin")
    ) {
      await Pet.findByIdAndDelete(req.params.id);
      res.json({ message: "Pet removed" });
    } else {
      res.status(404).json({ message: "Pet not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
