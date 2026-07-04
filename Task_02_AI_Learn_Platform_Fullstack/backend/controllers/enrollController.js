const { pool } = require("../db/index");

// ===================================================
// GET ALL COURSES
// ===================================================
const getAllCourses = async (req, res) => {
  try {
    console.log("Fetching all courses...");
    const result = await pool.query(
      "SELECT * FROM courses ORDER BY created_at DESC"
    );
    console.log("Courses found:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("Get Courses Error:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: err.message 
    });
  }
};

// ===================================================
// GET COURSE BY ID
// ===================================================
const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const result = await pool.query(
      "SELECT * FROM courses WHERE id = $1",
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.json({
      success: true,
      course: result.rows[0]
    });
  } catch (err) {
    console.error("Get Course Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================================================
// ENROLL COURSE
// ===================================================
const enrollCourse = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { course_id } = req.body;

    console.log("Enroll request:", { userId, course_id });

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    // Check if course exists
    const courseCheck = await pool.query(
      "SELECT id, price FROM courses WHERE id = $1",
      [course_id]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if already enrolled
    const existing = await pool.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [userId, course_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Already enrolled in this course"
      });
    }

    // Insert enrollment
    await pool.query(
      `INSERT INTO enrollments (user_id, course_id, status)
       VALUES ($1, $2, $3)`,
      [userId, course_id, 'active']
    );

    // Create progress entry
    await pool.query(
      `INSERT INTO progress (user_id, course_id, completed_percent)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [userId, course_id, 0]
    );

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in course"
    });
  } catch (err) {
    console.error("Enroll Error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: err.message 
    });
  }
};

// ===================================================
// GET MY ENROLLMENTS
// ===================================================
const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      `SELECT e.*, c.title, c.thumbnail, c.level, c.duration,
       p.completed_percent
       FROM enrollments e
       LEFT JOIN courses c ON e.course_id = c.id
       LEFT JOIN progress p ON e.user_id = p.user_id AND e.course_id = p.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      enrollments: result.rows
    });
  } catch (err) {
    console.error("Get Enrollments Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================================================
// CREATE COURSE (ADMIN)
// ===================================================
const createCourse = async (req, res) => {
  try {
    const { category_id, title, description, price, thumbnail, level, duration } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Title and category_id are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO courses (category_id, title, description, price, thumbnail, level, duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [category_id, title, description || null, price || 0, thumbnail || null, level || null, duration || null]
    );

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: result.rows[0]
    });
  } catch (err) {
    console.error("Create Course Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================================================
// UPDATE COURSE (ADMIN)
// ===================================================
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { category_id, title, description, price, thumbnail, level, duration } = req.body;

    const result = await pool.query(
      `UPDATE courses SET
        category_id = COALESCE($1, category_id),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        thumbnail = COALESCE($5, thumbnail),
        level = COALESCE($6, level),
        duration = COALESCE($7, duration)
       WHERE id = $8
       RETURNING *`,
      [category_id, title, description, price, thumbnail, level, duration, courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.json({
      success: true,
      message: "Course updated successfully",
      course: result.rows[0]
    });
  } catch (err) {
    console.error("Update Course Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================================================
// DELETE COURSE (ADMIN)
// ===================================================
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const result = await pool.query(
      "DELETE FROM courses WHERE id = $1 RETURNING *",
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.json({
      success: true,
      message: "Course deleted successfully"
    });
  } catch (err) {
    console.error("Delete Course Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  enrollCourse,
  getMyEnrollments,
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};