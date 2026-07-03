const pool = require("../db");

// POST /api/contact
const submitContact = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ error: "All fields are required" });

  try {
    await pool.query(
      "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)",
      [name, email, message]
    );

    res.status(201).json({ message: "Message sent successfully! We'll get back to you soon." });
  } catch (err) {
    console.error("Contact error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/contact  (admin use)
const getAllContacts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contacts ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { submitContact, getAllContacts };
