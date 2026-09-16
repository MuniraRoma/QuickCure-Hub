const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "quickcurehub_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "quickcurehub_refresh_secret";

const generateAccessToken = (payload) => {
  console.log("🔑 Generating access token for:", payload.email || payload._id);
  
  return jwt.sign(
    {
      _id: payload._id,
      id: payload._id,
      userId: payload._id,
      email: payload.email,
      role: payload.role || "user",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const generateRefreshToken = (payload) => {
  console.log("🔄 Generating refresh token for:", payload.email || payload._id);
  
  return jwt.sign(
    {
      _id: payload._id,
      id: payload._id,
      userId: payload._id,
      email: payload.email,
      role: payload.role || "user",
    },
    JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};