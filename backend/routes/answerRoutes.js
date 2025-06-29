const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const {
  submitAnswer,
  getAnswersByQuiz,
  getQuizResult
} = require('../controllers/answerController');

router.post('/', authenticateToken, submitAnswer);
router.get('/:quizId', authenticateToken, getAnswersByQuiz);
router.get('/result/:quizId', authenticateToken, getQuizResult);

module.exports = router;


