/*
  Warnings:

  - Added the required column `currency` to the `purchaseOrderItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchaseOrderItems" ADD COLUMN     "currency" TEXT NOT NULL;
