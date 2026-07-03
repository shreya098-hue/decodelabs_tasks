const pool = require("../db");

// POST /api/enroll  (requires auth)
const enrollCourse = async (req, res) => {
  const { course_name } = req.body;
  const userId = req.user.userId; // comes from auth middleware

  if (!course_name)
    return res.status(400).json({ error: "Course name is required" });

  try {
    // Check if already enrolled
    const existing = await pool.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_name = $2",
      [userId, course_name]
    );

    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Already enrolled in this course" });

    await pool.query(
      "INSERT INTO enrollments (user_id, course_name) VALUES ($1, $2)",
      [userId, course_name]
    );

    res.status(201).json({ message: `Successfully enrolled in ${course_name}!` });
  } catch (err) {
    console.error("Enroll error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/enroll/my  (get logged-in user's enrollments)
const getMyEnrollments = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "SELECT * FROM enrollments WHERE user_id = $1 ORDER BY enrolled_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/courses  (public)
const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { enrollCourse, getMyEnrollments, getAllCourses };
