-- AlterTable
ALTER TABLE "public"."notes" ADD COLUMN     "downloadPassword" TEXT,
ADD COLUMN     "passwordEnabled" BOOLEAN NOT NULL DEFAULT false;
