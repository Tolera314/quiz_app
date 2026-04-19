const prisma = require("../utils/prisma");

const createQuiz = async (req, res) => {
  try {
    const { title, description, category, timeLimit } = req.body;
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        category,
        timeLimit: parseInt(timeLimit),
        createdById: req.user.userId,
      },
    });
    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create quiz" });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const { attemptId } = req.query; // Optional attemptId for seeded randomization

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // Seeded Shuffling function (deterministic based on seed)
    const seededShuffle = (array, seed) => {
      if (!seed) return array.sort(() => Math.random() - 0.5);
      
      // Simple hash-based sort
      const hash = (str) => {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
          h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
        }
        return h;
      };

      return [...array].sort((a, b) => {
        const hashA = hash(a.id + seed);
        const hashB = hash(b.id + seed);
        return hashA - hashB;
      });
    };

    // Randomize questions
    quiz.questions = seededShuffle(quiz.questions, attemptId);

    // Randomize options for each question
    quiz.questions.forEach((q) => {
      q.options = seededShuffle(q.options, attemptId);
    });

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
};


const addQuestions = async (req, res) => {
  try {
    const { quizId, questions } = req.body; // questions: [{ text, options: [{text, isCorrect}] }]

    const createdQuestions = await Promise.all(
      questions.map(async (q) => {
        return prisma.question.create({
          data: {
            quizId,
            questionText: q.text,
            options: {
              create: q.options.map((opt) => ({
                optionText: opt.text,
                isCorrect: opt.isCorrect,
              })),
            },
          },
        });
      })
    );

    res.status(201).json(createdQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add questions" });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const leaderboard = await prisma.attempt.findMany({
      where: {
        quizId: id,
        completedAt: { not: null },
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: [
        { score: "desc" },
        { startedAt: "asc" }, // Tie-breaker: who finished faster (approx)
      ],
      take: 10,
    });
    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, timeLimit } = req.body;
    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        description,
        category,
        timeLimit: parseInt(timeLimit),
      },
    });
    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update quiz" });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    // Prisma cascading delete should handle questions and options if configured in the DB
    // However, our schema uses onDelete: Cascade on the Prisma level for Question/Option.
    // For Attempt/Answer, we may need to specify it or handle it.
    await prisma.quiz.delete({
      where: { id },
    });
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete quiz" });
  }
};

module.exports = { createQuiz, getQuizzes, getQuizById, addQuestions, getLeaderboard, updateQuiz, deleteQuiz };
