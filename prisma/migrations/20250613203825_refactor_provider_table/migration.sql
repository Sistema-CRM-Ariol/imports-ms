/*
  Warnings:

  - You are about to drop the `PurchaseOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey";

-- DropTable
DROP TABLE "PurchaseOrder";

-- DropTable
DROP TABLE "PurchaseOrderItem";

-- DropTable
DROP TABLE "Supplier";

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "country" TEXT,
    "taxId" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchaseOrders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "version" TEXT DEFAULT '1.2',
    "validUntil" TIMESTAMP(3),
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "containerInfo" TEXT,
    "paymentTerms" DECIMAL(65,30)[],
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'PENDING',
    "providerId" TEXT NOT NULL,
    "incoterm" TEXT,
    "deliveryTerms" TEXT,
    "expectedArrival" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchaseOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchaseOrderItems" (
    "id" SERIAL NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantityOrdered" INTEGER NOT NULL,
    "quantityReceived" INTEGER,
    "priceUnit" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchaseOrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "providers_code_key" ON "providers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "purchaseOrders_code_key" ON "purchaseOrders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "purchaseOrders_orderNumber_key" ON "purchaseOrders"("orderNumber");

-- AddForeignKey
ALTER TABLE "purchaseOrders" ADD CONSTRAINT "purchaseOrders_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchaseOrderItems" ADD CONSTRAINT "purchaseOrderItems_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchaseOrders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
