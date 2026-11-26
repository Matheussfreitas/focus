-- AlterTable
ALTER TABLE "user" ADD COLUMN     "privacyVersion" TEXT,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "termsVersion" TEXT;

-- CreateTable
CREATE TABLE "access_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "access_log_createdAt_idx" ON "access_log"("createdAt");

-- CreateIndex
CREATE INDEX "access_log_userId_idx" ON "access_log"("userId");
