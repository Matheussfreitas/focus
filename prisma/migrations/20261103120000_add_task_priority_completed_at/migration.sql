-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM';

-- Backfill: tasks já concluídas usam updatedAt como data de conclusão
UPDATE "task" SET "completedAt" = "updatedAt" WHERE "status" = 'DONE';
