const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fixing quiz data...");

  // Fix "Master Javascript"
  const jsQuiz = await prisma.quiz.findFirst({ where: { title: "Master Javascript" }, include: { questions: { include: { options: true } } } });
  if (jsQuiz) {
    for (const q of jsQuiz.questions) {
      if (q.questionText.includes("constant")) {
        for (const opt of q.options) {
          await prisma.option.update({ where: { id: opt.id }, data: { isCorrect: opt.optionText === "const" } });
        }
      } else if (q.questionText.includes("typeof null")) {
        for (const opt of q.options) {
          await prisma.option.update({ where: { id: opt.id }, data: { isCorrect: opt.optionText === "\"object\"" } });
        }
      }
    }
  }

  // Fix "advanced database"
  const dbQuiz = await prisma.quiz.findFirst({ where: { title: "advanced database" }, include: { questions: { include: { options: true } } } });
  if (dbQuiz) {
    for (const q of dbQuiz.questions) {
      if (q.questionText.includes("[] == false")) {
        for (const opt of q.options) {
          await prisma.option.update({ where: { id: opt.id }, data: { isCorrect: opt.optionText === "True" } });
        }
      } else if (q.questionText.includes("strict equality")) {
        for (const opt of q.options) {
          await prisma.option.update({ where: { id: opt.id }, data: { isCorrect: opt.optionText === "===" } });
        }
      } else if (q.questionText.includes("let x;")) {
        for (const opt of q.options) {
          await prisma.option.update({ where: { id: opt.id }, data: { isCorrect: opt.optionText === "undefined" } });
        }
      }
    }
  }

  console.log("Data fix complete.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
