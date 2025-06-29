const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Routes
const authRoutes = require('./routes/auth');
const answerRoutes = require('./routes/answerRoutes');
const quizRoutes = require('./routes/quizRoutes');
 


app.use('/api/auth', authRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/quiz', quizRoutes);
// Root endpoint
app.get('/', (req, res) => {
  res.send('Quiz Generator Backend is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
