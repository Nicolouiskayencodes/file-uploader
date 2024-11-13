/*
  Warnings:

  - You are about to drop the column `folderId` on the `Users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Users_folderId_key";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "folderId";
