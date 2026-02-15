/*
  Warnings:

  - You are about to drop the `providerContacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `providers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "providerContacts" DROP CONSTRAINT "providerContacts_providerId_fkey";

-- DropForeignKey
ALTER TABLE "purchaseOrders" DROP CONSTRAINT "purchaseOrders_providerId_fkey";

-- DropTable
DROP TABLE "providerContacts";

-- DropTable
DROP TABLE "providers";
