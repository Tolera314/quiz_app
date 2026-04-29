const express = require("express");
const {
  fetchQuestions,
  fetchCategories,
  fetchTags,
  importQuizFromApi,
  appendQuestionsToQuiz,
} = require("../controllers/quizApiController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// ── Public-style browsing (any authenticated user can browse external content) ──
// GET /api/quizapi/questions?categories=Linux&difficulty=easy&limit=10
router.get("/questions", authMiddleware, fetchQuestions);

// GET /api/quizapi/categories
router.get("/categories", authMiddleware, fetchCategories);

// GET /api/quizapi/tags
router.get("/tags", authMiddleware, fetchTags);

// ── Admin-only: import external questions into the local database ──
// POST /api/quizapi/import  — create a brand-new quiz from Trivia API
router.post("/import", authMiddleware, adminMiddleware, importQuizFromApi);

// POST /api/quizapi/import-questions/:quizId  — append to an existing quiz
router.post("/import-questions/:quizId", authMiddleware, adminMiddleware, appendQuestionsToQuiz);

module.exports = router;
