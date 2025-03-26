import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Créer l'utilisateur admin
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sonatel-academy.sn' },
    update: {},
    create: {
      email: 'admin@sonatel-academy.sn',
      password: adminPassword,
      role: UserRole.ADMIN,
      admin: {
        create: {
          firstName: 'Admin',
          lastName: 'Sonatel',
          phone: '+221777777777',
        },
      },
    },
  });

  console.log('Admin user created:', adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });