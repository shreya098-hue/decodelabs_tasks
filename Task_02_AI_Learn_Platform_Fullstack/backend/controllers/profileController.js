const { pool } = require("../db/index");

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      `SELECT id, name, email, role, phone, avatar, bio, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, avatar, bio } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        avatar = COALESCE($3, avatar),
        bio = COALESCE($4, bio),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, email, role, phone, avatar, bio, created_at`,
      [name, phone, avatar, bio, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    await pool.query(
      "UPDATE users SET avatar = $1 WHERE id = $2",
      [avatarUrl, userId]
    );

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: avatarUrl
    });
  } catch (err) {
    console.error("Upload Avatar Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar };