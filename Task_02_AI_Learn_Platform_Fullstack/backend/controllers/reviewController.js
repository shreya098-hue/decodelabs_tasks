const { pool } = require("../db/index");

const addReview = async (req, res) => {
  const userId = req.user.userId;
  const { course_id, rating, review } = req.body;

  if (!course_id || !rating) {
    return res.status(400).json({ success: false, message: "course_id and rating are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, course_id, rating, review)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, course_id, rating, review || null]
    );

    res.status(201).json({ success: true, review: result.rows[0] });
  } catch (err) {
    console.error("Add Review Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCourseReviews = async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.course_id = $1
       ORDER BY r.created_at DESC`,
      [courseId]
    );

    res.json({ success: true, reviews: result.rows });
  } catch (err) {
    console.error("Get Course Reviews Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { addReview, getCourseReviews };