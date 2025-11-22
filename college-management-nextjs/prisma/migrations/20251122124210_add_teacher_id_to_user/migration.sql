-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teacherId" TEXT;

-- CreateIndex
CREATE INDEX "User_teacherId_idx" ON "User"("teacherId");
