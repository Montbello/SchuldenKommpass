import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let postgresContainer: StartedPostgreSqlContainer;
let prisma: PrismaClient;

export const setupTestDatabase = async () => {
  // Start PostgreSQL container
  postgresContainer = await new PostgreSqlContainer('postgres:15')
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_password')
    .start();

  const connectionString = postgresContainer.getConnectionUri();
  process.env.DATABASE_URL = connectionString;

  // Initialize Prisma Client
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

  // Run migrations
  execSync(`DATABASE_URL="${connectionString}" npx prisma migrate deploy`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  return { prisma, container: postgresContainer };
};

export const teardownTestDatabase = async () => {
  if (prisma) {
    await prisma.$disconnect();
  }

  if (postgresContainer) {
    await postgresContainer.stop();
  }
};

export const seedTestData = async (prismaClient: PrismaClient) => {
  // Seed basic test data
  const testUser = await prismaClient.user.create({
    data: {
      email: 'test@example.com',
      password_hash: 'hashed_password',
      name: 'Test User',
      role: 'USER',
      status: 'ACTIVE',
      onboarding_status: 'APPROVED',
      level: 1,
      total_points: 0,
    },
  });

  const testAdvisor = await prismaClient.user.create({
    data: {
      email: 'advisor@example.com',
      password_hash: 'hashed_password',
      name: 'Test Advisor',
      role: 'ADVISOR',
      status: 'ACTIVE',
    },
  });

  const testInstitution = await prismaClient.user.create({
    data: {
      email: 'institution@example.com',
      password_hash: 'hashed_password',
      name: 'Test Institution User',
      role: 'INSTITUTION',
      status: 'ACTIVE',
      institution_id: 'test_institution_id',
    },
  });

  const testOrganisation = await prismaClient.organisation.create({
    data: {
      name: 'Test Organisation',
      type: 'JOBCENTER',
      contact_email: 'org@example.com',
      webhook_secret: 'test_webhook_secret',
      rate_limit_per_hour: 100,
    },
  });

  const testTask = await prismaClient.task.create({
    data: {
      title: 'Test Task',
      description: 'A test task for integration tests',
      required_skill: 'Testing',
      estimated_time: 60,
      organisationId: testOrganisation.org_id,
    },
  });

  return {
    testUser,
    testAdvisor,
    testInstitution,
    testOrganisation,
    testTask,
  };
};

export const clearTestData = async (prismaClient: PrismaClient) => {
  // Delete all data in reverse order of dependencies
  await prismaClient.progress.deleteMany();
  await prismaClient.match.deleteMany();
  await prismaClient.certificate.deleteMany();
  await prismaClient.document.deleteMany();
  await prismaClient.appointment.deleteMany();
  await prismaClient.skill.deleteMany();
  await prismaClient.task.deleteMany();
  await prismaClient.interaction.deleteMany();
  await prismaClient.contact.deleteMany();
  await prismaClient.report.deleteMany();
  await prismaClient.organisation.deleteMany();
  await prismaClient.user.deleteMany();
  await prismaClient.auditEvent.deleteMany();
};
