const { pool } = require("../db/index");

const checkoutPlan = async (req, res) => {
  const { course_id, amount, payment_method } = req.body;

  if (!course_id || !amount) {
    return res.status(400).json({ success: false, message: "course_id and amount are required" });
  }

  try {
    res.json({
      success: true,
      message: "Payment checkout initialized",
      data: {
        course_id,
        amount,
        payment_method: payment_method || "card",
        status: "ready",
      },
    });
  } catch (err) {
    console.error("Checkout Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const paymentSuccess = async (req, res) => {
  const { order_id, transaction_id, payment_method } = req.body;

  if (!order_id || !transaction_id) {
    return res.status(400).json({ success: false, message: "order_id and transaction_id are required" });
  }

  try {
    const result = await pool.query(
      `UPDATE orders
       SET payment_status = 'Completed', transaction_id = $1, payment_method = COALESCE($2, payment_method)
       WHERE id = $3
       RETURNING *`,
      [transaction_id, payment_method || null, order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Payment recorded", order: result.rows[0] });
  } catch (err) {
    console.error("Payment Success Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { checkoutPlan, paymentSuccess };