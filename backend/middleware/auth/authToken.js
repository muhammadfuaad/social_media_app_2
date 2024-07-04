const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: "Token is not found" });

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token", error: error });
  }
};

module.exports = auth;
