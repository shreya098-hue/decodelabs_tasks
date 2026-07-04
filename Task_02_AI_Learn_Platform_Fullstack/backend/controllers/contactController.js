const { pool } = require("../db/index");

// ===============================
// SUBMIT CONTACT FORM
// POST /api/contact
// ===============================
const submitContact = async (req, res) => {
  try {
    let { name, email, message } = req.body;

    // Trim Inputs
    name = name?.trim();
    email = email?.trim().toLowerCase();
    message = message?.trim();

    // Required Fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Name Validation
    if (name.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 3 characters",
      });
    }

    // Email Validation
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Message Validation
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message should be at least 10 characters",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters",
      });
    }

    await pool.query(
      `INSERT INTO contacts (name, email, message)
       VALUES ($1, $2, $3)`,
      [name, email, message]
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });

  } catch (err) {
    console.error("Contact Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// GET ALL CONTACTS (ADMIN)
// GET /api/contact
// ===============================
const getAllContacts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, message, created_at
       FROM contacts
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      contacts: result.rows,
    });

  } catch (err) {
    console.error("Get Contacts Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  submitContact,
  getAllContacts,
};