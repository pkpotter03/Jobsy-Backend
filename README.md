# Jobsy-Backend

**Jobsy-Backend** is the backend API for the Jobsy platform, a job portal application that allows users to register, apply for jobs, and manage job postings. This backend is built using **Node.js**, **Express**, and **MongoDB**. It includes authentication, job management, file uploads, and more. The backend is deployed on **AWS EC2** using **PM2** and **Nginx**, and supports continuous deployment via **GitHub Actions**.

---

## Table of Contents
- [Folder Structure](#folder-structure)
- [Features](#features)
- [Installation](#installation)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [License](#license)

---

## Folder Structure
```bash
Jobsy-Backend/
├── .github/
│ └── workflows/
│ └── deploy.yml
├── .gitignore
├── config/
│ ├── cloudinary.js
│ └── db.js
├── controllers/
│ ├── authController.js
│ ├── jobController.js
│ ├── testController.js
│ └── userController.js
├── middleware/
│ ├── authMiddleware.js
│ └── upload.js
├── models/
│ ├── Job.js
│ └── User.js
├── package-lock.json
├── package.json
├── routes/
│ ├── authRoutes.js
│ ├── jobRoutes.js
│ ├── testRoutes.js
│ └── userRoutes.js
└── server.js
```

---

## Features

- **User Authentication**: Register, login, and token refresh with JWT.
- **User Profile**: Update profile with file upload (resume), view private/public profiles.
- **Job Management**:
  - Create, update, delete jobs
  - Search and filter jobs
  - Apply for jobs
  - View relevant jobs and applied jobs
  - Manage applicants for posted jobs
  - Export shortlisted applicants
- **File Uploads**: Resume uploads handled via Cloudinary.
- **Protected Routes**: Role-based access using JWT.
- **CI/CD**: GitHub Actions workflow to automatically deploy backend on EC2 with PM2.

---

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/pkpotter03/Jobsy-Backend.git
cd Jobsy-Backend
```
2. **Install dependencies**
```bash
npm install
```
3. **Set up environment variables**

Create a `.env` file in the root directory with the following keys:
```bash
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
PORT=
NODE_ENV=
CLIENT_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
4. **Run the server**
```bash
npm run dev
```
Server runs on `http://localhost:5000` by default.

---
## API Routes

### Auth Routes
- POST `/api/auth/register` - Register a new user (upload resume)

- POST `/api/auth/login` - Login user

- POST `/api/auth/refresh-token` - Refresh access token

### User Routes

- PUT `/api/users/profile-update` - Update user profile (protected, upload resume)

- GET `/api/users/profile` - Get private user profile (protected)

- GET `/api/users/:id` - Get public user profile (protected)

### Job Routes

- POST `/api/jobs/create` - Create a new job (protected)

- GET `/api/jobs/jobslist` - List all jobs (protected)

- GET `/api/jobs/search` - Search jobs (protected)

- GET `/api/jobs/relevant` - Get relevant jobs based on user skills (protected)

- GET `/api/jobs/applied` - Get applied jobs for the user (protected)

- GET `/api/jobs/:id` - Get job by ID (protected)

- POST `/api/jobs/:id/apply` - Apply to a job (protected)

- PUT `/api/jobs/update/:id` - Update a job (protected)

- DELETE `/api/jobs/delete/:id` - Delete a job (protected)

- GET `/api/jobs/:id/applicants` - Get applicants for a job (protected)

- PUT `/api/jobs/:jobId/applicants/:applicantUserId` - Update applicant status (protected)

- GET `/api/jobs/:jobId/shortlisted/export` - Export shortlisted applicants (protected)

### Test Routes

- GET `/api/test` - Test route for API checks
---
## Deployment
- **Server**: AWS EC2
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)
Automatically pulls latest code from GitHub and restarts the server for continuous deployment.
---
## License
This project is licensed under the MIT License.
---