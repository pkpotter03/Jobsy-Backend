import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["applicant", "recruiter"], required: true },
  skills: [String],
  resume: String, // URL or file path
  appliedJobs: [
    {
      job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      status: { type: String, enum: ["applied", "shortlisted", "rejected"], default: "applied" }
    }
  ]
});

export default mongoose.model("User", userSchema);
