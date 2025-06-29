const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const {
  generateQuiz,
  getUserQuizzes,
  getQuizById,
  submitQuizAnswers,
  getAttemptsCount
} = require('../controllers/quizController');

router.post('/generate', authenticateToken, generateQuiz);
router.get('/', authenticateToken, getUserQuizzes);
router.get('/:id', authenticateToken, getQuizById);
router.post('/:id/submit', authenticateToken, submitQuizAnswers);
router.get('/:id/attempts-count', authenticateToken, getAttemptsCount);

module.exports = router;
