/*
  Warnings:

  - Added the required column `signout_uri` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "signout_uri" TEXT NOT NULL;
