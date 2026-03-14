const Emergency = require("../models/Emergency");
const Appointment = require("../models/Appointment");

// @desc    Create a new emergency (SOS)
// @route   POST /api/emergency
// @access  Private
exports.createEmergency = async (req, res) => {
  try {
    const { latitude, longitude, address, petId, description, emergencyType } =
      req.body;

    const emergency = await Emergency.create({
      userId: req.user._id,
      petId,
      location: { latitude, longitude, address },
      description,
      emergencyType,
    });

    // Populate for the socket broadcast
    const populatedEmergency = await Emergency.findById(emergency._id)
      .populate("userId", "name phone")
      .populate("petId", "name type breed");

    // Broadcast to all connected clients (vets/admin)
    const io = req.app.get("io");
    if (io) {
      io.emit("new_emergency", populatedEmergency);
    }

    res.status(201).json(populatedEmergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active emergencies (for Vets/Admin)
// @route   GET /api/emergency
// @access  Private
exports.getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate("userId", "name phone")
      .populate("petId", "name type breed")
      .sort("-createdAt");
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update emergency status (Accept/Resolve)
// @route   PUT /api/emergency/:id
// @access  Private
exports.updateEmergencyStatus = async (req, res) => {
  try {
    const { status, vetId } = req.body;
    const emergency = await Emergency.findById(req.params.id);

    if (emergency) {
      emergency.status = status || emergency.status;
      if (vetId) emergency.assignedVetId = vetId;

      const updatedEmergency = await emergency.save();

      // Notify status update via socket
      const io = req.app.get("io");
      if (io) {
        io.emit("emergency_status_updated", updatedEmergency);
      }

      res.json(updatedEmergency);
    } else {
      res.status(404).json({ message: "Emergency request not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create emergency appointment
// @route   POST /api/emergency/appointment
// @access  Private
exports.createEmergencyAppointment = async (req, res) => {
  try {
    const { petId, vetId, reason } = req.body;

    const appointment = await Appointment.create({
      userId: req.user._id,
      petId,
      vetId,
      date: new Date(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      reason: `EMERGENCY: ${reason || "Urgent assistance required"}`,
      status: "scheduled",
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
