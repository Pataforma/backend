/*
  Warnings:

  - You are about to drop the column `senha_hash` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "senha_hash";
