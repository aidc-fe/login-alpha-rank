/*
  Warnings:

  - You are about to drop the column `SSO` on the `BusinessDomain` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BusinessDomain" DROP COLUMN "SSO",
ADD COLUMN     "sso" BOOLEAN NOT NULL DEFAULT false;
