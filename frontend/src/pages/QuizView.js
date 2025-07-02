// src/pages/QuizView.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchQuizById,
  fetchAttemptsCount,
  submitQuizAnswers,
} from "../services/quizService";
import "./QuizView.css";

const QuizView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [attemptsCount, setAttemptsCount] = useState(0);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const res = await fetchQuizById(id);
        setQuiz(res.quiz);
        setQuestions(res.questions);
        setAnswers(res.answers);
        setAttempt(res.attempts?.[0] || null);

        
        if (res.answers && res.answers.length > 0) {
          const prefilled = {};
          res.answers.forEach((a) => {
            const index = res.questions.findIndex((q) => q.id === a.question_id);
            if (index !== -1) {
              prefilled[index] = a.selected_option;
            }
          });
          setUserAnswers(prefilled);
          setShowResult(true);
        }
      } catch (err) {
        console.error("Failed to load quiz", err);
      }
    };

    const loadAttemptCount = async () => {
      try {
        const count = await fetchAttemptsCount(id);
        setAttemptsCount(count.count);

      } catch (err) {
        console.error("Failed to fetch attempts count", err);
      }
    };

    loadQuizData();
    loadAttemptCount();
  }, [id]);

  const handleOptionSelect = (qIndex, option) => {
    setUserAnswers({ ...userAnswers, [qIndex]: option });
  };

  const handleSubmitQuiz = async () => {
    const submission = [];
    let score = 0;
    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const correct = selected === q.correct_option;
      if (correct) score++;
      submission.push({
        question_id: q.id,
        selected_option: selected,
        is_correct: correct,
      });      
    });

    try {
      await submitQuizAnswers(id, { answers: submission, score });
      setShowResult(true);
    } catch (err) {
      console.error("Failed to submit attempt", err);
      alert("Submission failed.");
    }
  };

  const handleRetake = async () => {
    try {
      const res = await fetchQuizById(id);
      localStorage.setItem("retakeQuiz", JSON.stringify({
        ...res.quiz,
        questions: res.questions
      }));
      navigate("/dashboard");
    } catch (err) {
      console.error("Retake failed", err);
    }
  };
  
  

  if (!quiz) return <div>Loading...</div>;

  return (
    <div className="quiz-view-container">
      <div className="quiz-header">
        <h2>{quiz.title}</h2>
        <div className="quiz-meta">
          <span>Difficulty: <strong>{quiz.difficulty}</strong></span>
          <span>Date: {new Date(quiz.created_at).toLocaleString()}</span>
          <span>Attempts: <strong>{attemptsCount}</strong></span>
        </div>
      </div>

      

      {questions.map((q, idx) => {
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
              </div>
            )}
          </div>
        );
      })}

      {!showResult && (
        <button className="send-button" onClick={handleSubmitQuiz}>
          Submit Quiz
        </button>
      )}

      {showResult && (
        <div className="quiz-result">
          <h4>
            Your Score:{" "}
            {questions.filter((q, idx) => userAnswers[idx] === q.correct_option).length}{" "}
            / {questions.length}
          </h4>
        </div>
      )}

      <button className="retake-button" onClick={handleRetake}>
        Retake Quiz
      </button>
    </div>
  );
};

export default QuizView;
