-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "rate_limit_per_hour" INTEGER DEFAULT 100,
ADD COLUMN     "webhook_secret" TEXT;
