const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware'); // import middleware

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// 🔐 Protected route example
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected profile route', user: req.user });
});

module.exports = router;
