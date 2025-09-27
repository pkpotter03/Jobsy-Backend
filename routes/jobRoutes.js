import express from "express";
import {
  createJob,
  updateJob,
  getJobsSearch,
  getJobById,
  getRelevantJobs,
  applyJob,
  getApplicants,
  updateApplicantStatus,
  exportShortlisted 
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Applicant
router.get("/search", protect, getJobsSearch);
router.get("/relevant", protect, getRelevantJobs);
router.get("/:id", protect, getJobById);
router.post("/:id/apply", protect, applyJob);

// Recruiter
router.post("/", protect, createJob);
router.put("/:id", protect, updateJob);
router.get("/:id/applicants", protect, getApplicants);
router.put("/:jobId/applicants/:applicantUserId", protect, updateApplicantStatus);
router.get("/:jobId/shortlisted/export", protect, exportShortlisted);

export default router;
