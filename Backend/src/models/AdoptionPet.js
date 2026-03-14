const mongoose = require("mongoose");

const adoptionPetSchema = new mongoose.Schema(
  {
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Dog", "Cat", "Bird", "Rabbit", "Other"],
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    description: {
      type: String,
      required: true,
    },
    healthStatus: {
      type: String,
      required: true,
    },
    vaccinationStatus: {
      type: String,
      required: true,
    },
    personality: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "pending", "adopted"],
      default: "available",
    },
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AdoptionPet", adoptionPetSchema);
