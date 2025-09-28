import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });

}

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

const setTokensInCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};


export const register = async (req, res) => {
  const { name, email, password, role, skills } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let resumeUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "resumes",
        resource_type: "auto",
        use_filename: true,
        unique_filename: false
      });
      resumeUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    let userSkills = [];
    if (skills) {
      if (Array.isArray(skills)) userSkills = skills.map((s) => s.trim().toLowerCase());
      else userSkills = skills.split(",").map((s) => s.trim().toLowerCase());
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      skills: userSkills,
      resume: resumeUrl,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    setTokensInCookies(res, accessToken, refreshToken);

    const createdUser = await User.findById(user._id).select("-password");

    res.status(201).json({ user: createdUser, accessToken, refreshToken, message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const login = async (req, res) => {
  const { email, password, role } = req.body; // include role from frontend
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This user is not a ${role}` });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    setTokensInCookies(res, accessToken, refreshToken);

    user.password = undefined;

    res.json({ user, accessToken, refreshToken, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const refreshToken = (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    });

    res.json({ message: "Access token refreshed" });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};


