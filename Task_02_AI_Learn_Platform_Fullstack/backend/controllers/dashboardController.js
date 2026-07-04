const { pool } = require("../db/index");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (isAdmin) {
      // Admin dashboard stats
      const stats = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM enrollments) as total_enrollments,
          (SELECT COUNT(*) FROM orders WHERE payment_status = 'Completed') as total_orders,
          (SELECT SUM(amount) FROM orders WHERE payment_status = 'Completed') as total_revenue,
          (SELECT COUNT(*) FROM contacts WHERE created_at > NOW() - INTERVAL '7 days') as recent_contacts
      `);

      // Recent orders
      const recentOrders = await pool.query(`
        SELECT o.*, u.name as user_name, c.title as course_title
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN courses c ON o.course_id = c.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `);

      return res.json({
        success: true,
        stats: stats.rows[0],
        recent_orders: recentOrders.rows
      });
    }

    // Student dashboard stats
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM enrollments WHERE user_id = $1 AND status = 'active') as active_courses,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = $1) as total_courses,
        (SELECT AVG(completed_percent) FROM progress WHERE user_id = $1) as avg_progress,
        (SELECT COUNT(*) FROM orders WHERE user_id = $1 AND payment_status = 'Completed') as total_orders
    `, [userId]);

    // Recent courses
    const recentCourses = await pool.query(`
      SELECT e.*, c.title, c.thumbnail
      FROM enrollments e
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC
      LIMIT 3
    `, [userId]);

    res.json({
      success: true,
      stats: stats.rows[0],
      recent_courses: recentCourses.rows
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getDashboardStats };