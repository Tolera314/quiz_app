const prisma = require("../utils/prisma");

const getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: "user" } });
    const totalQuizzes = await prisma.quiz.count();
    const totalAttempts = await prisma.attempt.count();

    res.json({
      totalUsers,
      totalQuizzes,
      totalAttempts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

const getQuizAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const attempts = await prisma.attempt.findMany({
      where: { quizId: id, completedAt: { not: null } },
      select: { score: true, userId: true, startedAt: true, completedAt: true },
    });

    const totalAttempts = attempts.length;
    const uniqueStudents = new Set(attempts.map(a => a.userId)).size;
    const avgScore = totalAttempts > 0 
      ? attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts 
      : 0;
    
    const highestScore = totalAttempts > 0 
      ? Math.max(...attempts.map(a => a.score)) 
      : 0;

    res.json({
      totalAttempts,
      uniqueStudents,
      avgScore,
      highestScore,
      recentAttempts: attempts.slice(0, 5),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch quiz analytics" });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, options } = req.body; // options: [{id, optionText, isCorrect}]

    await prisma.$transaction(async (tx) => {
      // Update question text
      await tx.question.update({
        where: { id },
        data: { questionText },
      });

      // Update options
      for (const opt of options) {
        if (opt.id) {
          await tx.option.update({
            where: { id: opt.id },
            data: { optionText: opt.optionText, isCorrect: opt.isCorrect },
          });
        }
      }
    });

    res.json({ message: "Question updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update question" });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Manually delete related answers if Cascade isn't set in schema for them
    await prisma.answer.deleteMany({ where: { questionId: id } });
    await prisma.question.delete({ where: { id } });

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete question" });
  }
};

const bulkUploadQuestions = async (req, res) => {
  try {
    const { quizId, questions } = req.body; // questions: [{questionText, options: [{optionText, isCorrect}]}]

    const created = await prisma.$transaction(
      questions.map((q) => 
        prisma.question.create({
          data: {
            quizId,
            questionText: q.questionText,
            options: {
              create: q.options.map((opt) => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
              })),
            },
          },
        })
      )
    );

    res.status(201).json({ message: `Successfully uploaded ${created.length} questions` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to bulk upload questions" });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { quizId, questionText, options } = req.body; // options: [{optionText, isCorrect}]

    const question = await prisma.question.create({
      data: {
        quizId,
        questionText,
        options: {
          create: options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      include: { options: true }
    });

    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create question" });
  }
};

module.exports = { getStats, getQuizAnalytics, updateQuestion, deleteQuestion, bulkUploadQuestions, createQuestion };


