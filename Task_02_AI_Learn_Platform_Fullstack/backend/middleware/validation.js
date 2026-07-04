const { body, param, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => e.msg)
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body("name").notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

// Course validations
const courseValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("category_id").isInt().withMessage("Valid category is required"),
  body("price").optional().isNumeric().withMessage("Price must be a number")
];

// Review validations
const reviewValidation = [
  body("course_id").isInt().withMessage("Valid course ID is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("review").optional().isLength({ max: 1000 }).withMessage("Review cannot exceed 1000 characters")
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  courseValidation,
  reviewValidation
};