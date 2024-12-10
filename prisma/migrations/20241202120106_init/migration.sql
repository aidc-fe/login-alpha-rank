/*
  Warnings:

  - Made the column `auth_domain` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "auth_domain" SET NOT NULL;
