-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "withGoogle" BOOLEAN NOT NULL DEFAULT false;
