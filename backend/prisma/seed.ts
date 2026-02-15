import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const seedUsers = [
  { email: 'admin@vehicles.local', name: 'Admin User', role: 'ADMIN' as const, password: 'Password123!' },
  { email: 'driver@vehicles.local', name: 'Driver One', role: 'DRIVER' as const, password: 'Password123!' },
  { email: 'auditor@vehicles.local', name: 'Auditor User', role: 'AUDITOR' as const, password: 'Password123!' },
];

async function main() {
  for (const u of seedUsers) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await prisma.user.upsert({
      where: {
        provider_providerId: { provider: 'email', providerId: u.email },
      },
      create: {
        email: u.email,
        name: u.name,
        provider: 'email',
        providerId: u.email,
        passwordHash,
        role: u.role,
      },
      update: {
        name: u.name,
        passwordHash,
        role: u.role,
      },
    });
  }
  console.log('Seed users created:', seedUsers.map((u) => u.email).join(', '));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
