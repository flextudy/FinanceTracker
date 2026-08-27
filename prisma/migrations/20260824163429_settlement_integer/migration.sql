/*
  Warnings:

  - Changed the type of `amountPaid` on the `Settlement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Settlement" DROP COLUMN "amountPaid",
ADD COLUMN     "amountPaid" INTEGER NOT NULL;
