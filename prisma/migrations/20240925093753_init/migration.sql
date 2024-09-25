/*
  Warnings:

  - Added the required column `owner_email` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "owner_email" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_owner_email_fkey" FOREIGN KEY ("owner_email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
