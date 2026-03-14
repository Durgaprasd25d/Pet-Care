const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinaryConfig");
const NotificationService = require("../services/notificationService");

// @desc    Create new community post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { content, category, petId, location } = req.body;
    let imageUrls = [];

    // Handle Cloudinary uploads if files are present
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "petcare_community" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            },
          );
          uploadStream.end(file.buffer);
        });
      });
      imageUrls = await Promise.all(uploadPromises);
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      images: imageUrls,
      category: category || "general",
      petId,
      location,
    });

    // Populate user before emitting
    const populatedPost = await Post.findById(post._id).populate(
      "user",
      "name avatar",
    );

    // Send push notification globally
    NotificationService.sendToAllUsers({
      title: 'New Community Post! 🐾',
      body: `${populatedPost.user.name} just posted: "${content.substring(0, 30)}..."`,
      data: { type: 'new_post', postId: post._id.toString() }
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      io.emit("post_created", populatedPost);
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get community feed
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(req.user._id);
    if (isLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
    } else {
      post.likes.push(req.user._id);

      // Create notification for post owner
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: "like",
          post: post._id,
          content: `${req.user.name} liked your post.`,
        });

        // Push notification
        NotificationService.sendToUser(post.user.toString(), {
          title: 'New Like! ❤️',
          body: `${req.user.name} liked your post.`,
          data: { type: 'like', postId: post._id.toString() }
        });
      }
    }

    await post.save();

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      io.emit("post_liked", {
        postId: post._id,
        likes: post.likes.length,
        userId: req.user._id, // To help client know if they liked it
        isLiked: !isLiked,
      });
    }

    res.json({ likes: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      text: req.body.text,
    });

    post.commentCount += 1;
    await post.save();

    // Create notification for post owner
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        content: `${req.user.name} commented on your post.`,
      });

      // Push notification
      NotificationService.sendToUser(post.user.toString(), {
        title: 'New Comment! 💬',
        body: `${req.user.name} commented: "${req.body.text}"`,
        data: { type: 'comment', postId: post._id.toString() }
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name avatar",
    );

    res.status(201).json(populatedComment);

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      io.emit("comment_added", {
        postId: post._id,
        comment: populatedComment,
        commentCount: post.commentCount,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get post comments
// @route   GET /api/posts/:id/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("user", "name avatar")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/community/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Optional: Check if user is owner or admin
    // For dashboard, we assume admin since it's the admin panel

    await post.deleteOne();

    // Delete associated comments
    await Comment.deleteMany({ post: req.params.id });

    res.json({ message: "Post and associated comments removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
