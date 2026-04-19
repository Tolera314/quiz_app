const express = require("express");
const { getStats, getQuizAnalytics, updateQuestion, deleteQuestion, bulkUploadQuestions, createQuestion } = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", authMiddleware, adminMiddleware, getStats);
router.get("/quizzes/:id/analytics", authMiddleware, adminMiddleware, getQuizAnalytics);
router.put("/questions/:id", authMiddleware, adminMiddleware, updateQuestion);
router.delete("/questions/:id", authMiddleware, adminMiddleware, deleteQuestion);
router.post("/quizzes/:id/bulk-questions", authMiddleware, adminMiddleware, bulkUploadQuestions);
router.post("/quizzes/:id/questions", authMiddleware, adminMiddleware, createQuestion);

module.exports = router;


