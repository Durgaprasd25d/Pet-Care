const mongoose = require("mongoose");

const vetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialty: String,
    rating: Number,
    distance: String,
    address: String,
    image: String,
    availability: [String],
    price: String,
    latitude: { type: Number },
    longitude: { type: Number },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Vet", vetSchema);
