/*
  Warnings:

  - You are about to drop the column `shop` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `shopDisplayName` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "shop",
DROP COLUMN "shopDisplayName",
ADD COLUMN     "shop_domain" TEXT,
ADD COLUMN     "shop_domain_display" TEXT;
