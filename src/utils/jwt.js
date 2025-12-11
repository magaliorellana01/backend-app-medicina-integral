const jwt = require("jsonwebtoken");

const generateToken = (payload, options = { expiresIn: "6h" }) => {
  if (options) {
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  } else {
    return jwt.sign(payload, process.env.JWT_SECRET);
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
