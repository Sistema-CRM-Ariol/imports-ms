/*
  Warnings:

  - You are about to drop the `purchaseOrderItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchaseOrders` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ImportOrderStatus" AS ENUM ('Pendiente', 'Cursando', 'Recibido', 'Cancelado', 'Completado');

-- DropForeignKey
ALTER TABLE "purchaseOrderItems" DROP CONSTRAINT "purchaseOrderItems_purchaseOrderId_fkey";

-- DropTable
DROP TABLE "purchaseOrderItems";

-- DropTable
DROP TABLE "purchaseOrders";

-- DropEnum
DROP TYPE "PurchaseOrderStatus";

-- CreateTable
CREATE TABLE "import_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedArrival" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "providerId" TEXT NOT NULL,
    "incoterm" TEXT,
    "status" "ImportOrderStatus" NOT NULL DEFAULT 'Pendiente',
    "warehouseId" TEXT NOT NULL,
    "warehouseName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_order_items" (
    "id" SERIAL NOT NULL,
    "importOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantityOrdered" INTEGER NOT NULL,
    "quantityReceived" INTEGER DEFAULT 0,
    "priceUnit" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "import_orders_orderNumber_key" ON "import_orders"("orderNumber");

-- AddForeignKey
ALTER TABLE "import_order_items" ADD CONSTRAINT "import_order_items_importOrderId_fkey" FOREIGN KEY ("importOrderId") REFERENCES "import_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
