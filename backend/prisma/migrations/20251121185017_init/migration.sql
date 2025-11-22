-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENTE', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CLIENTE';
