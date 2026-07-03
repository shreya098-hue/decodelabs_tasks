const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "ailearn_secret_key_change_in_prod";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader)
    return res.status(401).json({ error: "No token provided. Please login." });

  const token = authHeader.split(" ")[1]; // Format: "Bearer <token>"

  if (!token)
    return res.status(401).json({ error: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token. Please login again." });
  }
};

module.exports = verifyToken;
