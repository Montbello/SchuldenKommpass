-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('PROOF_MEDICAL', 'PROOF_FINANCIAL', 'PROOF_IDENTITY', 'PROOF_OTHER', 'TASK_PROOF', 'GENERAL');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'INSTITUTION';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "document_category" "DocumentCategory" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "verification_status" TEXT,
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consent_data_processing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consent_partner_sharing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "institution_id" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "onboarding_status" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "referred_by" TEXT,
ADD COLUMN     "stability_score" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "total_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unlocked_features" JSONB,
ADD COLUMN     "user_story" TEXT;
