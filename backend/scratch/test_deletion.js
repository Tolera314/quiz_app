const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testDeletion() {
  console.log("Starting Whitebox Test for Deletion...");

  try {
    // 1. Create a quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: "Deletion Test Quiz",
        category: "Testing",
        createdById: (await prisma.user.findFirst()).id,
      },
    });
    console.log(`Created Quiz: ${quiz.id}`);

    // 2. Create a question
    const question = await prisma.question.create({
      data: {
        quizId: quiz.id,
        questionText: "Does deletion work?",
      },
    });
    console.log(`Created Question: ${question.id}`);

    // 3. Create an attempt
    const attempt = await prisma.attempt.create({
      data: {
        quizId: quiz.id,
        userId: (await prisma.user.findFirst()).id,
        scheduledEndTime: new Date(Date.now() + 1000 * 60 * 10),
      },
    });
    console.log(`Created Attempt: ${attempt.id}`);

    // 4. Create an answer
    const answer = await prisma.answer.create({
      data: {
        attemptId: attempt.id,
        questionId: question.id,
        selectedOptionId: "some-id", // Note: This might fail if the option doesn't exist, but let's see if we can just test the relation
      },
    }).catch(e => {
        console.log("Answer creation failed as expected (missing option), but that's fine for quiz-to-attempt cascade test.");
    });

    // 5. Delete the quiz
    console.log("Deleting Quiz...");
    await prisma.quiz.delete({ where: { id: quiz.id } });

    // 6. Verify attempt is gone
    const attemptCheck = await prisma.attempt.findUnique({ where: { id: attempt.id } });
    if (!attemptCheck) {
      console.log("SUCCESS: Attempt was deleted automatically.");
    } else {
      console.error("FAILURE: Attempt still exists!");
    }

    // 7. Verify question is gone
    const questionCheck = await prisma.question.findUnique({ where: { id: question.id } });
    if (!questionCheck) {
      console.log("SUCCESS: Question was deleted automatically.");
    } else {
      console.error("FAILURE: Question still exists!");
    }

  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeletion();
