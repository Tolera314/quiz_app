const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  });

  console.log(JSON.stringify(quizzes, null, 2));

  const attempts = await prisma.attempt.findMany({
    include: {
      answers: true
    },
    orderBy: { startedAt: 'desc' },
    take: 1
  });

  console.log("Latest Attempt:");
  console.log(JSON.stringify(attempts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
