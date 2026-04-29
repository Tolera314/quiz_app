const axios = require("axios");
const prisma = require("../utils/prisma");

const TRIVIA_API_BASE = "https://the-trivia-api.com/api";

const triviaApiClient = axios.create({
  baseURL: TRIVIA_API_BASE,
  timeout: 10000,
});

// Helper to shuffle array
const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quizapi/questions
// Fetch questions from The Trivia API (does NOT save to DB)
// Query params: categories, difficulty, limit (default 10)
// ─────────────────────────────────────────────────────────────────────────────
const fetchQuestions = async (req, res) => {
  try {
    const { categories, difficulty, limit = 10 } = req.query;

    const params = { limit: Math.min(parseInt(limit, 10) || 10, 20) };
    if (categories) params.categories = categories;
    if (difficulty) params.difficulty = difficulty;

    const { data } = await triviaApiClient.get("/questions", { params });

    if (!Array.isArray(data)) {
      throw new Error("Unexpected response format from Trivia API");
    }

    // Normalize the response
    const questions = data.map((q) => {
      const allAnswers = shuffle([
        { text: q.correctAnswer, isCorrect: true },
        ...q.incorrectAnswers.map((ans) => ({ text: ans, isCorrect: false })),
      ]);

      return {
        id: q.id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        tags: q.tags || [],
        answers: allAnswers.map((a, idx) => ({
          key: `answer_${String.fromCharCode(97 + idx)}`, // a, b, c, d
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      };
    });

    res.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("[TriviaAPI] fetchQuestions error:", error.message);
    res.status(502).json({
      error: "Failed to fetch questions from Trivia API",
      detail: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quizapi/categories
// Returns available categories (Note: The Trivia API has a fixed set)
// ─────────────────────────────────────────────────────────────────────────────
const fetchCategories = async (req, res) => {
  try {
    // The Trivia API /categories returns an object where keys are names and values are slugs
    const { data } = await triviaApiClient.get("/categories");
    const formatted = Object.entries(data).map(([name, slugs]) => ({
      name,
      slug: Array.isArray(slugs) ? slugs[0] : slugs,
    }));
    res.json({ success: true, categories: formatted });
  } catch (error) {
    console.error("[TriviaAPI] fetchCategories error:", error.message);
    res.status(502).json({ error: "Failed to fetch categories from Trivia API" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quizapi/tags
// ─────────────────────────────────────────────────────────────────────────────
const fetchTags = async (req, res) => {
  try {
    const { data } = await triviaApiClient.get("/tags");
    res.json({ success: true, tags: data });
  } catch (error) {
    console.error("[TriviaAPI] fetchTags error:", error.message);
    res.status(502).json({ error: "Failed to fetch tags from Trivia API" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quizapi/import
// Fetch and save as a new Quiz
// ─────────────────────────────────────────────────────────────────────────────
const importQuizFromApi = async (req, res) => {
  try {
    const {
      title,
      description,
      categories,
      difficulty,
      limit = 10,
      timeLimit = 600,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Quiz title is required" });
    }

    // 1. Pull questions
    const params = { limit: Math.min(parseInt(limit, 10) || 10, 20) };
    if (categories) params.categories = categories;
    if (difficulty) params.difficulty = difficulty;

    const { data: rawQuestions } = await triviaApiClient.get("/questions", { params });

    if (!Array.isArray(rawQuestions)) {
      throw new Error("Unexpected response format from Trivia API");
    }

    // 2. Build payload
    const questionsPayload = rawQuestions.map((q) => {
      const options = [
        { optionText: q.correctAnswer, isCorrect: true },
        ...q.incorrectAnswers.map((ans) => ({ optionText: ans, isCorrect: false })),
      ];

      return {
        questionText: q.question,
        options: { create: shuffle(options) },
      };
    });

    // 3. Resolve creator
    let creatorId = req.user?.userId;
    if (!creatorId) {
      const admin = await prisma.user.findFirst({ where: { role: "admin" } });
      creatorId = admin?.id;
    }

    if (!creatorId) {
      return res.status(500).json({ error: "No user context to assign as creator" });
    }

    // 4. Create Quiz
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || `Imported Trivia Quiz - ${categories || "Mixed"}`,
        category: categories || "General",
        timeLimit: parseInt(timeLimit, 10),
        createdById: creatorId,
        questions: { create: questionsPayload },
      },
      include: {
        questions: { include: { options: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: `Quiz "${quiz.title}" imported successfully with ${quiz.questions.length} questions`,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        questionCount: quiz.questions.length,
      },
    });
  } catch (error) {
    console.error("[TriviaAPI] importQuizFromApi error:", error.message);
    res.status(500).json({
      error: "Failed to import quiz from Trivia API",
      detail: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quizapi/import-questions/:quizId
// ─────────────────────────────────────────────────────────────────────────────
const appendQuestionsToQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { categories, difficulty, limit = 5 } = req.body;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const params = { limit: Math.min(parseInt(limit, 10) || 5, 20) };
    if (categories) params.categories = categories;
    if (difficulty) params.difficulty = difficulty;

    const { data: rawQuestions } = await triviaApiClient.get("/questions", { params });

    if (!Array.isArray(rawQuestions)) {
      throw new Error("Unexpected response format from Trivia API");
    }

    const created = await Promise.all(
      rawQuestions.map((q) => {
        const options = [
          { optionText: q.correctAnswer, isCorrect: true },
          ...q.incorrectAnswers.map((ans) => ({ optionText: ans, isCorrect: false })),
        ];

        return prisma.question.create({
          data: {
            quizId,
            questionText: q.question,
            options: { create: shuffle(options) },
          },
        });
      })
    );

    res.status(201).json({
      success: true,
      message: `${created.length} questions appended to quiz "${quiz.title}"`,
    });
  } catch (error) {
    console.error("[TriviaAPI] appendQuestionsToQuiz error:", error.message);
    res.status(500).json({ error: "Failed to append questions from Trivia API" });
  }
};

module.exports = {
  fetchQuestions,
  fetchCategories,
  fetchTags,
  importQuizFromApi,
  appendQuestionsToQuiz,
};
