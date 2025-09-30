import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  experienceRequired: String,
  location: String,
  Company: String,
  salary: String,
  skillsRequired: [String],
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  applicants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["applied", "shortlisted", "rejected"], default: "applied" }
    }
  ]
});

export default mongoose.model("Job", jobSchema);
