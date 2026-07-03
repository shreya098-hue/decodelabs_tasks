const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "ailearn_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "yourpassword",
});

pool.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ PostgreSQL connected successfully");
  }
});

module.exports = pool;
