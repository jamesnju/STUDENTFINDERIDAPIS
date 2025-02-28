/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `FoundID` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `LostID` table. All the data in the column will be lost.
  - Added the required column `image` to the `FoundID` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `LostID` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FoundID" DROP COLUMN "imageUrl",
ADD COLUMN     "image" BYTEA NOT NULL;

-- AlterTable
ALTER TABLE "LostID" DROP COLUMN "imageUrl",
ADD COLUMN     "image" BYTEA NOT NULL;
