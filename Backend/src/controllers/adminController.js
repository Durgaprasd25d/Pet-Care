const Vet = require("../models/Vet");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const MedicalRecord = require("../models/MedicalRecord");
const User = require("../models/User");
const Adoption = require("../models/Adoption");
const LostPet = require("../models/LostPet");
const Post = require("../models/Post");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.getStats = async (req, res) => {
  try {
    const [
      totalPets,
      totalVets,
      totalAppointments,
      totalUsers,
      totalAdoptions,
      totalLostReports,
      totalPosts,
    ] = await Promise.all([
      Pet.countDocuments(),
      Vet.countDocuments(),
      Appointment.countDocuments(),
      User.countDocuments(),
      Adoption.countDocuments(),
      LostPet.countDocuments(),
      Post.countDocuments(),
    ]);

    res.json({
      totalPets,
      totalVets,
      totalAppointments,
      totalUsers,
      totalAdoptions,
      totalLostReports,
      totalPosts,
      activeUsers: Math.floor(totalUsers * 0.85), // Heuristic or real active query
      newReports: totalLostReports, // Recent reports count could be filtered by date
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVetStats = async (req, res) => {
  try {
    const vetId = req.user._id;

    const [totalAppointments, totalPatientsList, totalPrescriptions] =
      await Promise.all([
        Appointment.countDocuments({ vetId }),
        Appointment.distinct("petId", { vetId }),
        Prescription.countDocuments({ vetId }),
      ]);

    res.json({
      totalAppointments,
      totalPatients: totalPatientsList.length,
      totalPrescriptions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNgoStats = async (req, res) => {
  try {
    const [pendingAdoptions, lostPetReports, activeCampaigns] =
      await Promise.all([
        Adoption.countDocuments({ status: "pending" }),
        LostPet.countDocuments({ status: "active" }),
        Adoption.countDocuments({ status: { $ne: "adopted" } }),
      ]);

    res.json({
      pendingAdoptions,
      lostPetReports,
      activeCampaigns,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStoreStats = async (req, res) => {
  try {
    const storeId = req.user._id;

    const myProducts = await Product.find({ storeId }).select("_id");
    const myProductIds = myProducts.map((p) => p._id);

    const [totalProducts, activeBookings, customers] = await Promise.all([
      Product.countDocuments({ storeId }),
      Order.countDocuments({
        "items.productId": { $in: myProductIds },
        status: { $in: ["placed", "confirmed", "out_for_delivery"] },
      }),
      Order.distinct("userId", { "items.productId": { $in: myProductIds } }),
    ]);

    res.json({
      totalProducts,
      activeBookings,
      customerContacts: customers.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
