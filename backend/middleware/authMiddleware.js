const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Get the Authorization header
  const token = authHeader && authHeader.split(' ')[1]; // Get the token part

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach decoded token to request
    next(); // Proceed to the next middleware or route
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

module.exports = authenticateToken;
