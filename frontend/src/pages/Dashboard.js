// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { FiPlus, FiSend } from "react-icons/fi";

import { useNavigate, useLocation } from "react-router-dom";

import {
  generateQuiz,
  fetchAllQuizzes,
  fetchQuizById,
  submitQuizAnswers,
} from "../services/quizService";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedRetakeQuiz = localStorage.getItem("retakeQuiz");


  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const data = await fetchAllQuizzes();
        setQuizHistory(data);
      } catch (err) {
        console.error("Error loading quiz history:", err);
      }
    };
  
    const loadRetakeQuiz = () => {
      if (storedRetakeQuiz) {
        const parsed = JSON.parse(storedRetakeQuiz);
        setCurrentQuiz(parsed);
        setUserAnswers({});
        setShowResult(false);
        localStorage.removeItem("retakeQuiz"); 
      }
    };
  
    loadQuizzes();
    loadRetakeQuiz();
  }, []);
   
  
  

  const handleSend = async () => {
    try {
      const result = await generateQuiz({ notes, difficulty, numQuestions });
  
      // 🔍 Log what you get
      console.log("📦 generateQuiz result:", result);
  
      const fullQuiz = await fetchQuizById(result.quiz.id);
      console.log("✅ fullQuiz from backend:", fullQuiz); // 👈 Add this
  
      setCurrentQuiz({
        ...fullQuiz.quiz,
        questions: fullQuiz.questions,
      });
      
      setUserAnswers({});
      setShowResult(false);
      setNotes("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Quiz generation failed", err);
      alert("Failed to generate quiz");
    }
  };
  

  const handleOptionSelect = (qIndex, option) => {
    setUserAnswers({ ...userAnswers, [qIndex]: option });
  };

  const handleSubmitQuiz = async () => {
    setShowResult(true);
    const answersPayload = currentQuiz.questions.map((q, index) => ({
      question_id: q.id,
      selected_option: userAnswers[index] || null,
    }));
    await submitQuizAnswers(currentQuiz.id, { answers: answersPayload });
  };

  const calculateScore = () => {
    let correct = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_option) correct++;
    });
    return correct;
  };

  const handleQuizClick = (id) => {
    navigate(`/quiz/${id}`);
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Past Quizzes</h3>
        <ul className="quiz-list">
          {quizHistory.map((quiz) => (
            <li key={quiz.id} onClick={() => handleQuizClick(quiz.id)}>
              <strong>Quiz - {quiz.id}</strong>
              <small>{new Date(quiz.created_at).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      </div>

      <div className="main-area">
        <div className="welcome-message">
          <h2>Welcome to SmartQuiz!</h2>
          <p>Paste your text below  to generate a quiz.</p>
        </div>

        
            {currentQuiz && (
  <div className="quiz-scroll-wrapper">
    <div className="quiz-display">
      <h3 className="quiz-title-centered">Quiz - {currentQuiz.id}</h3>
      <div className="quiz-scroll-area">
        {currentQuiz.questions.map((q, idx) => {
          const userAnswer = userAnswers[idx];
          const isCorrect = userAnswer === q.correct_option;

          return (
            <div key={idx} className="question-block">
              <p>
                <strong>Q{idx + 1}:</strong> {q.question_text}
              </p>
              <div className="options">
                {["A", "B", "C", "D"].map((key) => (
                  <label key={key} className="option-label">
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={key}
                      checked={userAnswers[idx] === key}
                      onChange={() => handleOptionSelect(idx, key)}
                      disabled={showResult}
                    />
                    {key}. {q[`option_${key.toLowerCase()}`]}
                    {showResult && userAnswer === key && (
                      <span
                        style={{
                          marginLeft: "8px",
                          color: isCorrect ? "green" : "red",
                        }}
                      >
                        {isCorrect ? "✅" : "❌"}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {showResult && (
                <div className="explanation">
                  <p>
                    <strong>Correct Answer:</strong> {q.correct_option}.{" "}
                    {q[`option_${q.correct_option.toLowerCase()}`]}
                  </p>
                  {q.explanation && (
                    <p>
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showResult && (
        <div className="submit-button-container">
          <button className="send-button" onClick={handleSubmitQuiz}>
            Submit Quiz
          </button>
        </div>
      )}

      {showResult && (
        <div className="quiz-result">
          <h4>
            Your Score: {calculateScore()} / {currentQuiz.questions.length}
          </h4>
        </div>
      )}
    </div>
  </div>
)}


        <div className="note-section">
          <textarea
            className="text-input"
            placeholder="Type or paste your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>

          {selectedFile && <div className="file-preview">📄 {selectedFile.name}</div>}

          <div className="actions">
            <div className="quiz-options-inline">
              <label className="inline-label">
                Difficulty:
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="dropdown"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </label>

              <label className="inline-label">
                No. of Questions:
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="number-input"
                />
              </label>

              

              <button className="send-button" onClick={handleSend}>
                <FiSend /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
