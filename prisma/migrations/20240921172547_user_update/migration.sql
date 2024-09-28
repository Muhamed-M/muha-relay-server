-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('online', 'offline', 'away');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'deleted', 'deactivated');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activityStatus" "ActivityStatus" NOT NULL DEFAULT 'offline',
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active';
