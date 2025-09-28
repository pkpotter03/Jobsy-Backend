import User from "../models/User.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";

export const updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.skills) {
      if (Array.isArray(updateData.skills))
        updateData.skills = updateData.skills.map((s) => s.trim().toLowerCase());
      else
        updateData.skills = updateData.skills.split(",").map((s) => s.trim().toLowerCase());
    }

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "resumes",
          resource_type: "auto",
          use_filename: true,
          unique_filename: false,
        });

        updateData.resume = result.secure_url;
      } catch (cloudErr) {
        return res.status(500).json({ message: "Cloudinary upload failed", error: cloudErr.message });
      } finally {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
    }

    // Prevent unsafe updates
    delete updateData._id;
    delete updateData.password;
    delete updateData.role;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select("-password");
    res.json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getuserProfilePrivate = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserProfilePublic = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
