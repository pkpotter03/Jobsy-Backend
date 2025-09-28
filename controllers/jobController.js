import Job from "../models/Job.js";
import ExcelJS from "exceljs";


export const createJob = async (req, res) => {
  try {
    if(req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can create jobs" });
    }
    const job = await Job.create({ ...req.body, recruiter: req.user._id });
    res.status(201).json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    if(req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can update jobs" });
    }
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRelevantJobs = async (req, res) => {
  try {
    const userSkills = req.user.skills.map(s => s.trim().toLowerCase());

    const jobs = await Job.find({
      skillsRequired: { 
        $in: userSkills.map(s => s.trim().toLowerCase())
      }
    });

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getJobsSearch = async (req, res) => {
  const { title, location, skills } = req.query;
  let query = {};
  if (title) query.title = { $regex: title, $options: "i" };
  if (location) query.location = { $regex: location, $options: "i" };
  if (skills) query.skillsRequired = { $in: skills.split(",") };

  try {
    const jobs = await Job.find(query);
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.applicants.push({ user: req.user._id });
    await job.save();
    res.json({ message: "Applied successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getApplicants = async (req, res) => {
  try {
    if(req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can view applicants" });
    }
    const job = await Job.findById(req.params.id).populate("applicants.user", "name email skills resume");
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ jobId: job._id, title: job.title, applicants: job.applicants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateApplicantStatus = async (req, res) => {
  try {
    if(req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can update applicant status" });
    }
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

     const applicant = job.applicants.find(app => app.user.toString() === req.params.applicantUserId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });
    applicant.status = req.body.status;
    await job.save();
    res.json({ applicant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const exportShortlisted = async (req, res) => {
  try {
    if(req.user.role !== "recruiter") {
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