const express = require("express");
const router = express.Router();
const {
  createPost,
  getPosts,
  likePost,
  addComment,
  getComments,
  deletePost,
} = require("../controllers/communityController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .get(getPosts)
  .post(protect, upload.array("images"), createPost);

router.post("/:id/like", protect, likePost);

router.route("/:id/comments").get(getComments).post(protect, addComment);

router.delete("/:id", protect, deletePost);

module.exports = router;
