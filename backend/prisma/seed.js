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

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log(`Admin created: ${admin.email} (Password: ${adminPassword})`);
  } else {
    console.log("Admin already exists, skipping...");
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
