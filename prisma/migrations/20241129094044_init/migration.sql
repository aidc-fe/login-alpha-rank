/*
  Warnings:

  - You are about to drop the column `singleSignOnRequired` on the `BusinessDomain` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BusinessDomain" DROP COLUMN "singleSignOnRequired",
ADD COLUMN     "SSO" BOOLEAN NOT NULL DEFAULT false;
