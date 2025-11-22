/*
  Warnings:

  - You are about to drop the column `price` on the `services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "price",
ADD COLUMN     "price_grande" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
ADD COLUMN     "price_medio" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
ADD COLUMN     "price_pequeno" DOUBLE PRECISION NOT NULL DEFAULT 0.00;
