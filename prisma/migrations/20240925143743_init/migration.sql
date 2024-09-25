/*
  Warnings:

  - You are about to drop the column `userName` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "userName",
ADD COLUMN     "user_name" TEXT;
