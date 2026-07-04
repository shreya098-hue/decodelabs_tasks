const { pool } = require("../db/index");

const createOrder = async (req, res) => {
  const userId = req.user.userId;
  const { course_id, amount, payment_method, transaction_id } = req.body;

  if (!course_id || !amount) {
    return res.status(400).json({ success: false, message: "course_id and amount are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO orders
        (user_id, course_id, amount, payment_method, transaction_id, payment_status)
      VALUES ($1, $2, $3, $4, $5, 'Pending')
      RETURNING *`,
      [userId, course_id, amount, payment_method || null, transaction_id || null]
    );

    res.status(201).json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error("Create Order Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getMyOrders = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT o.*, c.title AS course_title
       FROM orders o
       LEFT JOIN courses c ON o.course_id = c.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Get My Orders Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name AS user_name, c.title AS course_title
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN courses c ON o.course_id = c.id
       ORDER BY o.created_at DESC`
    );

    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Get All Orders Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders };