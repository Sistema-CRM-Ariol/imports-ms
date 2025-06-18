/*
  Warnings:

  - You are about to drop the column `containerInfo` on the `purchaseOrders` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryTerms` on the `purchaseOrders` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTerms` on the `purchaseOrders` table. All the data in the column will be lost.
  - You are about to drop the column `validUntil` on the `purchaseOrders` table. All the data in the column will be lost.
  - Added the required column `productName` to the `purchaseOrderItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchaseOrderItems" ADD COLUMN     "productName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchaseOrders" DROP COLUMN "containerInfo",
DROP COLUMN "deliveryTerms",
DROP COLUMN "paymentTerms",
DROP COLUMN "validUntil",
ADD COLUMN     "warehouseId" TEXT,
ADD COLUMN     "warehouseName" TEXT,
ALTER COLUMN "createdBy" DROP NOT NULL;
