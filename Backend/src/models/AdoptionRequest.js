const mongoose = require("mongoose");

const adoptionRequestSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdoptionPet",
      required: true,
    },
    adopter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    shelterMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AdoptionRequest", adoptionRequestSchema);
