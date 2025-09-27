import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["applicant", "recruiter"], required: true },
  skills: [String],
  resume: String // URL or file path
});

export default mongoose.model("User", userSchema);
