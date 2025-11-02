-- CreateEnum
CREATE TYPE "CheckpointType" AS ENUM ('SINGLE', 'MULTIPLE');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('NOT_VISITED', 'INSIDE', 'EXITED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'admin');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'admin',

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "branch" TEXT,
    "year" TEXT,
    "token" TEXT NOT NULL,
    "qrUrl" TEXT NOT NULL,
    "registrationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CheckpointType" NOT NULL,
    "timeLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "lastStatus" "VisitStatus" NOT NULL DEFAULT 'NOT_VISITED',
    "lastScanTime" TIMESTAMP(3),

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_email_key" ON "Participant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_token_key" ON "Participant"("token");

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
