const express = require("express");
const { startAttempt, submitAttempt, getHistory, getAttemptResult, saveAnswer, getLatestUnfinished } = require("../controllers/attemptController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/latest-unfinished", authMiddleware, getLatestUnfinished);
router.post("/start", authMiddleware, startAttempt);
router.post("/save-answer", authMiddleware, saveAnswer);
router.post("/submit", authMiddleware, submitAttempt);
router.get("/history", authMiddleware, getHistory);
router.get("/:id", authMiddleware, getAttemptResult);

module.exports = router;

