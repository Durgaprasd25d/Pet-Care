const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,
    location: String,
    avatar: String,
    role: {
      type: String,
      enum: ["owner", "vet", "ngo", "store", "admin"],
      default: "owner",
    },
    otp: String,
    otpExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Vet specific fields
    specialty: {
      type: String,
      default: "General Veterinarian",
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviews: {
      type: Number,
      default: 12,
    },
    clinicName: {
      type: String,
      default: "PetCare Wellness Clinic",
    },
    about: {
      type: String,
      default:
        "Experienced veterinarian dedicated to provide the best care for your pets.",
    },
    address: String,
    availability: {
      type: [String],
      default: ["Mon - Fri", "09:00 AM - 06:00 PM"],
    },
    price: {
      type: String,
      default: "$25 - $50",
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },

  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
