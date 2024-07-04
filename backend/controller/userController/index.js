const fs = require("fs");
const path = require("path");
const User = require("../../model/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key";
const cloudinary = require("cloudinary").v2;
const { uploadOnCloudinary } = require("../../utility/cloudanry");

const getNextId = async () => {
  try {
    const lastForm = await User.findOne().sort({ id: -1 });
    return lastForm ? lastForm.id + 1 : 1;
  } catch (error) {
    throw new Error("Error fetching the next user ID");
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const id = await getNextId();
    const fileUrl = req.file
      ? await uploadOnCloudinary(req.file.path)
      : "default-file.jpg";
    const result = await User.create({
      id: id,
      name: name,
      email: email,
      password: password,
      file: fileUrl,
    });
    res
      .status(201)
      .json({ message: "User successfully created", data: result });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};
// login

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      secretKey
    );
    res.json({ message: "Login successful", data: user, token: token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// get all user
exports.showdata = async (req, res) => {
  try {
    const data = await User.find();
    res.status(200).json({ message: "Get data successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving data", error });
  }
};
// get user by id
exports.showdatabyid = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: "Error fetching user", error });
  }
};
// update user api
exports.editdata = async (req, res) => {
  const { id } = req.params;

  // Validate if id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const updates = req.body;

  try {
    const user = await User.findOne({ _id: id }); // Use _id instead of id
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (req.file) {
      if (user.file && user.file !== "default-file.jpg") {
        const publicId = user.file.split("/").pop().split(".")[0];
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Error deleting old file from Cloudinary:", error);
          } else {
            console.log("Old file deleted from Cloudinary:", result);
          }
        });
      }

      const newFileUrl = await uploadOnCloudinary(req.file.path);
      updates.file = newFileUrl;
    }

    const updatedUser = await User.findOneAndUpdate({ _id: id }, updates, {
      new: true,
    });
    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).send({ message: "Error updating user", error });
  }
};
//? delete user by id
exports.deletedata = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure id is a valid MongoDB ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid user ID" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.file && user.file !== "default-file.jpg") {
      const publicId = user.file.split("/").pop().split(".")[0];
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting file from Cloudinary:", error);
        } else {
          console.log("File deleted from Cloudinary:", result);
        }
      });
    }

    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ message: "Error deleting user", error });
  }
};
// logout user
exports.logout = async (req, res) => {
  res.status(200).json({ message: "Logout successful" });
};
