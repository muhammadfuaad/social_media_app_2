const Post = require("../../model/post/index");
const User = require("../../model/user");
const path = require("path");
const fs = require("fs");
const { uploadOnCloudinary } = require("../../utility/cloudanry");

exports.addPost = async (req, res) => {
  try {
    const { content } = req.body;
    const id = req.user.userId;
    console.log(id);

    let fileUrl = "default-file.jpg";
    if (req.file) {
      fileUrl = await uploadOnCloudinary(req.file.path);
    }

    const newPost = new Post({
      userId: id,
      content: content,
      file: fileUrl,
    });

    const savedPost = await newPost.save();
    res
      .status(201)
      .json({ message: "Student added successfully", data: savedPost });
  } catch (error) {
    console.error("Error adding student:", error);
    res
      .status(500)
      .json({ message: "Error adding student", error: error.message });
  }
};
// get with specific user

exports.getPost = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ message: "User ID not found in request" });
    }

    const userId = req.user.userId;

    const data = await Post.find({ userId: userId }).populate(
      "userId",
      "name file"
    );

    res
      .status(200)
      .json({ message: "Post retrieved successfully", data: data, id: userId });
  } catch (error) {
    console.error("Error retrieving post:", error);
    res
      .status(500)
      .json({ message: "Error retrieving post", error: error.message });
  }
};

// Get all Postes
exports.getAllPosts = async (req, res) => {
  try {
    const data = await Post.find().populate("userId", "name file");

    res
      .status(200)
      .json({ message: "All posts retrieved successfully", data: data });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res
      .status(500)
      .json({ message: "Error retrieving posts", error: error.message });
  }
};

//? update the post

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this post" });
    }

    if (req.file) {
      if (post.file && post.file !== "default-file.jpg") {
        const oldFilePath = path.join(__dirname, "../public/upload", post.file);
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Error deleting old file:", err);
          }
        });
      }
      
      const newFileUrl = await uploadOnCloudinary(req.file.path);
      updates.file = newFileUrl;
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: "Post updated successfully", data: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
};

//? Delete a post
exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this post" });
    }

    if (post.file && post.file !== "default-file.jpg") {
      const filePath = path.join(__dirname, "../public/upload", post.file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting post" });
  }
};




// Like a post
exports.likePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.likes.includes(req.user.userId)) {
      post.likes.push(req.user.userId);
      await post.save();
      return res.status(200).json({ message: "Post liked successfully", data: post });
    } else {
      return res.status(400).json({ message: "Post already liked" });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Error liking post", error: error.message });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  console.log("Request params:", req.params);
  const  {id}  = req.params;
   

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(req.user.userId)) {
      post.likes.pull(req.user.userId);
      await post.save();
      return res.status(200).json({ message: "Post unliked successfully", data: post });
    } else {
      return res.status(400).json({ message: "Post not liked yet" });
    }
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ message: "Error unliking post", error: error.message });
  }
};


exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.userId;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      userId,
      content,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ message: "Comment added successfully", data: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
};

// Get comments for a specific post
exports.getComments = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId).populate("comments.userId", "name");
    // console.log(post)
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Comments retrieved successfully", data: post.comments });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ message: "Error retrieving comments", error: error.message });
  }
};