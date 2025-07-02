// src/services/quizService.js
import api from "./api"; // now this always includes token

export const generateQuiz = async ({ notes, difficulty, numQuestions }) => {
  const res = await api.post("/quiz/generate", {
    text: notes,
    difficulty,
    numQuestions,
  });
  return res.data;
};

export const fetchAllQuizzes = async () => {
  const res = await api.get("/quiz");
  return res.data;
};

export const fetchQuizById = async (quizId) => {
  const res = await api.get(`/quiz/${quizId}`);
  return res.data;
};

export const submitQuizAnswers = async (quizId, { answers, score }) => {
  const res = await api.post(`/quiz/${quizId}/submit`, { answers, score });
  return res.data;
};

export const fetchAttemptsCount = async (quizId) => {
  const res = await api.get(`/quiz/${quizId}/attempts-count`);
  return res.data;
};
