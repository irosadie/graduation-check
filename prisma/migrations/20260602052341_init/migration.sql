-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PASSED', 'UNPASSED');

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "nisn" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trafics" (
    "id" UUID NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "user_info" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trafics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_nisn_key" ON "students"("nisn");

