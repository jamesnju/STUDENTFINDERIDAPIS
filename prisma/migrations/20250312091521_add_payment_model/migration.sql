/*
  Warnings:

  - You are about to drop the column `description` on the `FoundID` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `LostID` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FoundID" DROP COLUMN "description",
ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "LostID" DROP COLUMN "description",
ADD COLUMN     "status" TEXT;

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'MPESA',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    "merchantRequestId" TEXT,
    "mpesaReceipt" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
