const { pool } = require("../db/index");

const updateProgress = async (req, res) => {
  const userId = req.user.userId;
  const { course_id, completed_percent, last_video } = req.body;

  if (!course_id) {
    return res.status(400).json({ success: false, message: "course_id is required" });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM progress WHERE user_id = $1 AND course_id = $2",
      [userId, course_id]
    );

    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE progress
         SET completed_percent = $1, last_video = $2, updated_at = NOW()
         WHERE user_id = $3 AND course_id = $4
         RETURNING *`,
        [completed_percent || 0, last_video || null, userId, course_id]
      );

      return res.json({ success: true, progress: result.rows[0] });
    }

    const result = await pool.query(
      `INSERT INTO progress (user_id, course_id, completed_percent, last_video)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, course_id, completed_percent || 0, last_video || null]
    );

    res.status(201).json({ success: true, progress: result.rows[0] });
  } catch (err) {
    console.error("Update Progress Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProgress = async (req, res) => {
  const userId = req.user.userId;
  const courseId = req.params.courseId;

  try {
    const result = await pool.query(
      "SELECT * FROM progress WHERE user_id = $1 AND course_id = $2",
      [userId, courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Progress not found" });
    }

    res.json({ success: true, progress: result.rows[0] });
  } catch (err) {
    console.error("Get Progress Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { updateProgress, getProgress };