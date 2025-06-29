const pool = require('../db');
const { GeminiAPI } = require('../utils/geminiClient');

// Generate a quiz
const generateQuiz = async (req, res) => {
  const { text, numQuestions, difficulty } = req.body;
  const userId = req.user.userId;

  const prompt = `
Generate ${numQuestions} ${difficulty}-level multiple-choice reasoning questions from the following text:

"${text}"

Return JSON in this format:
[
  {
    "question": "...",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correct_option": "B"
  }
]
`;

  try {
    const questions = await GeminiAPI(prompt);
    const quizInsert = await pool.query(
      `INSERT INTO quizzes (user_id, title, difficulty) VALUES ($1, $2, $3) RETURNING id`,
      [userId, '', difficulty]
    );
    
    const quizId = quizInsert.rows[0].id;
    
    const updatedQuiz = await pool.query(
      `UPDATE quizzes SET title = $1 WHERE id = $2 RETURNING *`,
      [`Quiz - ${quizId}`, quizId]
    );
    
    
    

    for (const q of questions) {
      await pool.query(
        `INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          quizId,
          q.question || q.question_text,
          q.options.A,
          q.options.B,
          q.options.C,
          q.options.D,
          q.correct_option
        ]
      );
    }

    const updatedQuiziz = await pool.query(
      `SELECT * FROM quizzes WHERE id = $1`,
      [quizId]
    );
    res.status(201).json({ message: 'Quiz created', quiz: updatedQuiziz.rows[0] });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Quiz generation failed' });
  }
};

// Fetch all quizzes for the logged-in user
const getUserQuizzes = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM quizzes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

// Get a single quiz with questions, past attempts, and answers
const getQuizById = async (req, res) => {
  const userId = req.user.userId;
  const quizId = req.params.id;

  try {
    const quizResult = await pool.query(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [quizId, userId]
    );
    const quiz = quizResult.rows[0];
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const questionsResult = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_option 
       FROM questions WHERE quiz_id = $1`,
      [quizId]
    );

    const attemptsResult = await pool.query(
      `SELECT * FROM attempts WHERE quiz_id = $1 AND user_id = $2 ORDER BY attempted_at DESC`,
      [quizId, userId]
    );

    const answersResult = await pool.query(
      `SELECT * FROM answers WHERE quiz_id = $1 AND user_id = $2`,
      [quizId, userId]
    );

    res.status(200).json({
      quiz: quiz, 
      questions: questionsResult.rows,
      attempts: attemptsResult.rows,
      answers: answersResult.rows
    });
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
};

// Submit quiz attempt
// controllers/quizController.js
const submitQuizAnswers = async (req, res) => {
  const quizId = parseInt(req.params.id);
  const userId = req.user.userId;
  const { answers, score } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ Step 1: Delete previous answers for this user and quiz
    await client.query(
      `DELETE FROM answers WHERE user_id = $1 AND quiz_id = $2`,
      [userId, quizId]
    );

    // ✅ Step 2: Insert new answers
    for (let ans of answers) {
      await client.query(
        `INSERT INTO answers (user_id, quiz_id, question_id, selected_option, is_correct, answered_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [userId, quizId, ans.question_id, ans.selected_option, ans.is_correct]
      );
    }

    // ✅ Step 3: Insert into attempts table
    await client.query(
      `INSERT INTO attempts (user_id, quiz_id, score, attempted_at)
       VALUES ($1, $2, $3, NOW())`,
      [userId, quizId, score]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Quiz submitted successfully." });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Quiz submission error:", err);
    res.status(500).json({ error: "Submission failed: " + err.message });
  } finally {
    client.release();
  }
};



// Get number of attempts for a quiz
const getAttemptsCount = async (req, res) => {
  const userId = req.user.userId;
  const quizId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM attempts WHERE quiz_id = $1 AND user_id = $2`,
      [quizId, userId]
    );
    const count = result.rows[0].count;
    res.status(200).json({ count: parseInt(count) });
  } catch (err) {
    console.error('Error fetching attempts count:', err);
    res.status(500).json({ message: 'Failed to fetch attempts count' });
  }
};

module.exports = {
  generateQuiz,
  getUserQuizzes,
  getQuizById,
  submitQuizAnswers,
  getAttemptsCount
};
