const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const { submitContact, getAllContacts } = require("../controllers/contactController");
const { enrollCourse, getMyEnrollments, getAllCourses } = require("../controllers/enrollController");
const verifyToken = require("../middleware/auth");

// ─── Auth Routes ───────────────────────────────────────────
router.post("/auth/register", register);
router.post("/auth/login", login);

// ─── Contact Routes ────────────────────────────────────────
router.post("/contact", submitContact);
router.get("/contact", getAllContacts); // admin only in production

// ─── Course Routes ─────────────────────────────────────────
router.get("/courses", getAllCourses); // public

// ─── Enrollment Routes (protected) ────────────────────────
router.post("/enroll", verifyToken, enrollCourse);
router.get("/enroll/my", verifyToken, getMyEnrollments);

module.exports = router;
