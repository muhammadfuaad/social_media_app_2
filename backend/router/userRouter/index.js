const express = require("express");
const router = express.Router();
const upload = require("../../middleware/multer");
const auth=require("../../middleware/auth/authToken")
const {
  signup,
  login,
  showdata,
  editdata,
  showdatabyid,
  deletedata,
  logout
} = require("../../controller/userController");

router.post("/signup", upload.single("profilePicture"), signup);
router.post("/login", login);
router.get("/signup",showdata);
router.get("/user/:id",auth, showdatabyid);
router.patch("/user/:id", upload.single("profilePicture"), editdata);
router.delete("/signup/:id", upload.single("profilePicture"), deletedata);
router.post("/logout",logout);

module.exports = router;
