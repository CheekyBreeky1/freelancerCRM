import { beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { prisma } from '../db/prisma';

beforeAll(async () => {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
});

beforeEach(async () => {
  await prisma.subTask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});