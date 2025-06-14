/*
  Warnings:

  - You are about to drop the column `contactEmail` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `providers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "providers" DROP COLUMN "contactEmail",
DROP COLUMN "contactName",
DROP COLUMN "contactPhone";

-- CreateTable
CREATE TABLE "providerContacts" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providerContacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "providerContacts" ADD CONSTRAINT "providerContacts_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
