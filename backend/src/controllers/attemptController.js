const prisma = require("../utils/prisma");

const startAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user.userId;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const timeLimit = quiz.timeLimit ?? 600; // Default 10 minutes if not configured
    const scheduledEndTime = new Date(Date.now() + timeLimit * 1000);

    const attempt = await prisma.attempt.create({
      data: {
        userId,
        quizId,
        scheduledEndTime,
      },
    });

    res.status(201).json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to start attempt" });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const { attemptId, answers } = req.body; // answers: [{ questionId, selectedOptionId }]
    
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { quiz: { include: { questions: { include: { options: true } } } } }
    });

    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    if (attempt.completedAt) return res.status(400).json({ error: "Attempt already submitted" });

    // Calculate score
    let score = 0;
    const answerData = [];

    for (const ans of answers) {
      const question = attempt.quiz.questions.find(q => q.id === ans.questionId);
      if (question) {
        const selectedOption = question.options.find(opt => opt.id === ans.selectedOptionId);
        if (selectedOption && selectedOption.isCorrect) {
          score++;
        }
        answerData.push({
          attemptId,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId
        });
      }
    }

    // Use transaction to save/update answers and finalize attempt
    const updatedAttempt = await prisma.$transaction(async (tx) => {
      // Upsert answers individually to be safe and idempotent
      for (const data of answerData) {
        await tx.answer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: data.attemptId,
              questionId: data.questionId,
            },
          },
          update: {
            selectedOptionId: data.selectedOptionId,
          },
          create: {
            attemptId: data.attemptId,
            questionId: data.questionId,
            selectedOptionId: data.selectedOptionId,
          },
        });
      }

      // Update attempt to completed
      return tx.attempt.update({
        where: { id: attemptId },
        data: {
          score,
          completedAt: new Date(),
        },
      });
    });

    res.json(updatedAttempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit attempt" });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: {
        quiz: true,
      },
      orderBy: { startedAt: "desc" },
    });
    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

const getAttemptResult = async (req, res) => {
  try {
    const { id } = req.params;
    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        },
        answers: true,
      }
    });

    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    // Handle auto-submit if time has passed and not completed
    if (!attempt.completedAt && new Date() > attempt.scheduledEndTime) {
      // In a real production app, we might trigger this calculation on a background job or here
      // For MVP, we'll just return the score as 0 or calculate from whatever answers were saved (if any)
      // Since current implementation saves answers only on submit, an auto-submit would mean 0 score
      // Unless we implement auto-save during the quiz.
    }

    res.json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch attempt result" });
  }
};

const saveAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedOptionId } = req.body;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    if (attempt.completedAt) return res.status(400).json({ error: "Attempt already submitted" });

    const answer = await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        selectedOptionId,
      },
      create: {
        attemptId,
        questionId,
        selectedOptionId,
      },
    });

    res.json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save answer" });
  }
};

const getLatestUnfinished = async (req, res) => {
  try {
    const userId = req.user.userId;
    const attempt = await prisma.attempt.findFirst({
      where: {
        userId,
        completedAt: null,
        scheduledEndTime: { gt: new Date() }, // Still have time
      },
      include: {
        quiz: true,
      },
      orderBy: { startedAt: "desc" },
    });
    res.json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch latest unfinished attempt" });
  }
};

module.exports = { startAttempt, submitAttempt, getHistory, getAttemptResult, saveAnswer, getLatestUnfinished };
