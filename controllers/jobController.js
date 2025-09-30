// controllers/jobController.js
import Job from "../models/Job.js";
import User from "../models/User.js";
import ExcelJS from "exceljs";

// Create Job
export const createJob = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can create jobs" });
    }
    const jobData = { ...req.body, recruiter: req.user._id };
    if ("skillsRequired" in req.body) {
      jobData.skillsRequired = req.body.skillsRequired.map(s => s.trim().toLowerCase());
    }

    const job = await Job.create(jobData);

    res.status(201).json({ job });
  } catch (err) {
    console.error(err); // For debugging
    res.status(500).json({ message: err.message });
  }
};

// Update Job
export const updateJob = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can update jobs" });
    }
    const updateData = { ...req.body };
    if ("skillsRequired" in req.body) {
      updateData.skillsRequired = req.body.skillsRequired.map(s => s.trim().toLowerCase());
    }

    const job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ job });
  } catch (err) {
    console.error(err); // For debugging
    res.status(500).json({ message: err.message });
  }
};


// Delete Job
export const deleteJob = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can delete jobs" });
    }
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Job By ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Relevant Jobs (based on user skills)
export const getRelevantJobs = async (req, res) => {
  try {
    const userSkills = req.user.skills.map(s => s.trim().toLowerCase());

    const jobs = await Job.aggregate([
      {
        $addFields: {
          matchedSkills: {
            $size: {
              $setIntersection: ["$skillsRequired", userSkills]
            }
          }
        }
      },
      { $match: { matchedSkills: { $gt: 0 } } }, 
      { $sort: { matchedSkills: -1 } } 
    ]);

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Search Jobs
export const getJobsSearch = async (req, res) => {
  const { title, location, experience } = req.query;
  let query = {};
  if (title) query.title = { $regex: title, $options: "i" };
  if (location) query.location = { $regex: location, $options: "i" };
  if (experience) query.experienceRequired = { $regex: experience, $options: "i" };

  try {
    const jobs = await Job.find(query);
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Apply Job (sync Job + User)
export const applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const user = await User.findById(req.user._id);

    // Prevent duplicate apply
    if (user.appliedJobs.some(app => app.job.toString() === job._id.toString())) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    // Add to job
    job.applicants.push({ user: req.user._id, status: "applied" });
    await job.save();

    // Add to user
    user.appliedJobs.push({ job: job._id, status: "applied" });
    await user.save();

    res.json({ message: "Applied successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Applied Jobs (from User model)
export const getAppliedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("appliedJobs.job");
    res.json({ jobs: user.appliedJobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJobsList = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can view job list" });
    }
    const jobs = await Job.find({ recruiter: req.user._id });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Applicants (for recruiter)
export const getApplicants = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can view applicants" });
    }
    const job = await Job.findById(req.params.id).populate("applicants.user", "name email skills resume");
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ jobId: job._id, title: job.title, applicants: job.applicants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Applicant Status (sync Job + User)
export const updateApplicantStatus = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can update applicant status" });
    }

    const { jobId, applicantUserId } = req.params;
    const { status } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Update inside Job
    const applicant = job.applicants.find(a => a.user.toString() === applicantUserId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });
    applicant.status = status;
    await job.save();

    // Update inside User
    const user = await User.findById(applicantUserId);
    const appliedJob = user.appliedJobs.find(j => j.job.toString() === jobId);
    if (appliedJob) {
      appliedJob.status = status;
      await user.save();
    }

    res.json({ message: "Status updated", applicant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export shortlisted applicants
export const exportShortlisted = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can export shortlisted applicants" });
    }
    const { jobId } = req.params;

    const job = await Job.findById(jobId).populate("applicants.user", "name email resume");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const shortlisted = job.applicants.filter(app => app.status === "shortlisted");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Shortlisted Applicants");

    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Resume Link", key: "resume", width: 50 },
    ];

    shortlisted.forEach(app => {
      worksheet.addRow({
        name: app.user.name,
        email: app.user.email,
        resume: { text: app.user.resume, hyperlink: app.user.resume },
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=shortlisted_${jobId}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};