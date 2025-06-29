const pool = require('../db');

// Save or update an answer with correctness check
const submitAnswer = async (req, res) => {
  const { quiz_id, question_id, selected_option } = req.body;
  const user_id = req.user.userId; // Extracted from JWT

  try {
    // Get the correct option for the question
    const correctQuery = await pool.query(
      'SELECT correct_option FROM questions WHERE id = $1',
      [question_id]
    );

    if (correctQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const correctOption = correctQuery.rows[0].correct_option;
    const isCorrect = selected_option === correctOption;

    // Check if an answer already exists for this question by this user
    const existing = await pool.query(
      `SELECT id FROM answers WHERE user_id = $1 AND quiz_id = $2 AND question_id = $3`,
      [user_id, quiz_id, question_id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing answer
      const answerId = existing.rows[0].id;
      result = await pool.query(
        `UPDATE answers 
         SET selected_option = $1, is_correct = $2, answered_at = CURRENT_TIMESTAMP 
         WHERE id = $3 
         RETURNING *`,
        [selected_option, isCorrect, answerId]
      );
    } else {
      // Insert new answer
      result = await pool.query(
        `INSERT INTO answers (user_id, quiz_id, question_id, selected_option, is_correct)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [user_id, quiz_id, question_id, selected_option, isCorrect]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Error submitting answer' });
  }
};

// Fetch all answers submitted by a user for a quiz
const getAnswersByQuiz = async (req, res) => {
  const user_id = req.user.userId;
  const { quizId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM answers WHERE user_id = $1 AND quiz_id = $2`,
      [user_id, quizId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching answers' });
  }
};

// Calculate and return the quiz result
const getQuizResult = async (req, res) => {
  const user_id = req.user.userId;
  const { quizId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE is_correct IS TRUE) AS correct_count,
         COUNT(*) AS total_count
       FROM answers
       WHERE user_id = $1 AND quiz_id = $2`,
      [user_id, quizId]
    );

    const { correct_count, total_count } = result.rows[0];
    const score = ((correct_count / total_count) * 100).toFixed(2);

    res.status(200).json({
      totalQuestions: total_count,
      correctAnswers: correct_count,
      score: `${score}%`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching quiz result' });
  }
};

module.exports = {
  submitAnswer,
  getAnswersByQuiz,
  getQuizResult
};
