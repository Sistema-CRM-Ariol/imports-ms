/*
  Warnings:

  - You are about to drop the column `code` on the `purchaseOrders` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "purchaseOrders_code_key";

-- AlterTable
ALTER TABLE "purchaseOrders" DROP COLUMN "code";
