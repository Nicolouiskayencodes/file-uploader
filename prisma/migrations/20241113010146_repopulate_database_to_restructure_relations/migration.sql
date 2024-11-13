/*
  Warnings:

  - Added the required column `ownerId` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_folderId_fkey";

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
