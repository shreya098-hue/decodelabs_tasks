const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL Connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL Error:", err.message);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("📅 Database Time:", result.rows[0].now);
    client.release();
    console.log("🚀 Database Ready");
  } catch (err) {
    console.error("❌ Database Connection Failed");
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.pool = pool;