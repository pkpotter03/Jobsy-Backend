import express from "express";
import {
  createJob,
  updateJob,
  deleteJob,
  getJobsSearch,
  getJobById,
  getRelevantJobs,
  applyJob,
  getAppliedJobs,
  getJobsList,
  getApplicants,
  updateApplicantStatus,
  exportShortlisted 
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createJob);
router.get("/jobslist", protect, getJobsList);

// Applicant
router.get("/search", protect, getJobsSearch);
router.get("/relevant", protect, getRelevantJobs);
router.get("/applied", protect, getAppliedJobs);  
router.get("/:id", protect, getJobById);
router.post("/:id/apply", protect, applyJob);

// Recruiter
router.put("/update/:id", protect, updateJob);
router.delete("/delete/:id", protect, deleteJob);
router.get("/:id/applicants", protect, getApplicants);
router.put("/:jobId/applicants/:applicantUserId", protect, updateApplicantStatus);
router.get("/:jobId/shortlisted/export", protect, exportShortlisted);

export default router;
