const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@quizapp.com";
  const adminPassword = "adminpassword123";

  console.log("Seeding database...");

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let admin;
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log(`Admin created: ${admin.email} (Password: ${adminPassword})`);
  } else {
    admin = existingAdmin;
    console.log("Admin already exists.");
  }

  // Seed sample quizzes if they don't exist by title
  const sampleQuizzes = [
    {
      title: "JavaScript Basics",
      description: "Test your core JavaScript knowledge.",
      category: "JavaScript",
      timeLimit: 300,
      questions: [
        {
          questionText: "What does 'var' stand for?",
          options: [
            { optionText: "Variable", isCorrect: true },
            { optionText: "Value", isCorrect: false },
            { optionText: "Variant", isCorrect: false },
            { optionText: "Vector", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Linux Foundations",
      description: "Command line and system basics.",
      category: "Linux",
      timeLimit: 600,
      questions: [
        {
          questionText: "Which command lists files in a directory?",
          options: [
            { optionText: "ls", isCorrect: true },
            { optionText: "cd", isCorrect: false },
            { optionText: "pwd", isCorrect: false },
            { optionText: "mv", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "SQL Mastery",
      description: "Relational database concepts and queries.",
      category: "Database",
      timeLimit: 450,
      questions: [
        {
          questionText: "What does SQL stand for?",
          options: [
            { optionText: "Structured Query Language", isCorrect: true },
            { optionText: "Simple Query Language", isCorrect: false },
            { optionText: "Standard Query Language", isCorrect: false },
            { optionText: "Sequential Query Language", isCorrect: false },
          ],
        },
      ],
    },
  ];

  console.log("Checking sample quizzes...");
  for (const quizData of sampleQuizzes) {
    const existing = await prisma.quiz.findFirst({
      where: { title: quizData.title },
    });

    if (!existing) {
      console.log(`Seeding quiz: ${quizData.title}`);
      await prisma.quiz.create({
        data: {
          title: quizData.title,
          description: quizData.description,
          category: quizData.category,
          timeLimit: quizData.timeLimit,
          createdById: admin.id,
          questions: {
            create: quizData.questions.map((q) => ({
              questionText: q.questionText,
              options: {
                create: q.options,
              },
            })),
          },
        },
      });
    } else {
      console.log(`Quiz already exists: ${quizData.title}`);
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
