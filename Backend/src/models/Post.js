const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: [String],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },
    lostPetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LostPet",
    },
    location: String,
    category: {
      type: String,
      enum: ["general", "health", "training", "stories", "lost_found"],
      default: "general",
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);
