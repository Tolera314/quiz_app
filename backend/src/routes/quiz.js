const express = require("express");
const { createQuiz, getQuizzes, getQuizById, addQuestions, getLeaderboard, updateQuiz, deleteQuiz } = require("../controllers/quizController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, getQuizzes);
router.get("/:id", authMiddleware, getQuizById);
router.get("/:id/leaderboard", authMiddleware, getLeaderboard);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createQuiz);
router.put("/:id", authMiddleware, adminMiddleware, updateQuiz);
router.delete("/:id", authMiddleware, adminMiddleware, deleteQuiz);
router.post("/questions", authMiddleware, adminMiddleware, addQuestions);

module.exports = router;
