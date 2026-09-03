import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing passwords...");
  const users = await prisma.user.findMany();

  for (const u of users) {
    // If the password is not a bcrypt hash (doesn't start with $2)
    if (!u.password.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      
      await prisma.user.update({
        where: { id: u.id },
        data: { password: hashedPassword }
      });
      console.log(`Hashed password for user: ${u.email}`);
    } else {
      console.log(`Password already hashed for user: ${u.email}`);
    }
  }
  console.log("Password fix complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
