const express = require("express");
const router = express.Router();

// ======================
// Controllers
// ======================
const {
  register,
  login,
  changePassword
} = require("../controllers/authController");

const {
  submitContact,
  getAllContacts,
} = require("../controllers/contactController");

const {
  enrollCourse,
  getMyEnrollments,
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/enrollController");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
} = require("../controllers/orderController");

const {
  checkoutPlan,
  paymentSuccess,
} = require("../controllers/paymentController");

const {
  addReview,
  getCourseReviews,
} = require("../controllers/reviewController");

const {
  updateProgress,
  getProgress,
} = require("../controllers/progressController");

// ======================
// Middleware
// ======================
const verifyToken = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

// ===================================================
// AUTH
// ===================================================
router.post("/auth/register", register);
router.post("/auth/login", login);
router.put("/auth/password", verifyToken, changePassword);

// ===================================================
// PROFILE
// ===================================================
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

// ===================================================
// CONTACT
// ===================================================
router.post("/contact", submitContact);
router.get("/contact", verifyToken, adminOnly, getAllContacts);

// ===================================================
// COURSES
// ===================================================
router.get("/courses", getAllCourses);
router.get("/courses/:id", getCourseById);
router.post("/courses", verifyToken, adminOnly, createCourse);
router.put("/courses/:id", verifyToken, adminOnly, updateCourse);
router.delete("/courses/:id", verifyToken, adminOnly, deleteCourse);

// ===================================================
// ENROLLMENT
// ===================================================
router.post("/enroll", verifyToken, enrollCourse);
router.get("/enroll/my", verifyToken, getMyEnrollments);

// ===================================================
// ORDERS
// ===================================================
router.post("/orders", verifyToken, createOrder);
router.get("/orders/my", verifyToken, getMyOrders);
router.get("/orders", verifyToken, adminOnly, getAllOrders);

// ===================================================
// PAYMENTS
// ===================================================
router.post("/payment/checkout", verifyToken, checkoutPlan);
router.post("/payment/success", verifyToken, paymentSuccess);

// ===================================================
// REVIEWS
// ===================================================
router.post("/reviews", verifyToken, addReview);
router.get("/reviews/:courseId", getCourseReviews);

// ===================================================
// PROGRESS
// ===================================================
router.put("/progress", verifyToken, updateProgress);
router.get("/progress/:courseId", verifyToken, getProgress);

// ===================================================
// HEALTH CHECK
// ===================================================
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API Working Successfully 🚀",
  });
});

module.exports = router;