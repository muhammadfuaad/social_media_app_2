const express = require("express");
const router = express.Router();
const upload = require("../../middleware/multer");
const {
  addPost,
  getPost,
  getAllPosts,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
} = require("../../controller/PostController/index");
const auth = require("../../middleware/auth/authToken");

router.post("/post", auth, upload.single("profilePicture"), addPost);
router.get("/post", getAllPosts);
// auth user
router.get("/post/user", auth, getPost);
router.patch("/post/:id", auth, upload.single("profilePicture"), updatePost);
router.delete("/post/:id", auth, deletePost);
// Like a post
router.post("/post/:id/like", auth, likePost);
router.post("/post/:id/unlike", auth, unlikePost);
// Add a comment to a post
router.post("/post/:postId/comment", auth, addComment);
router.get("/post/:postId/comment", getComments);

module.exports = router;
