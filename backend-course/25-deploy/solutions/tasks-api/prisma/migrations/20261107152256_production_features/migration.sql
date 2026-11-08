-- AlterTable
ALTER TABLE "users" ADD COLUMN     "time_zone" TEXT NOT NULL DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "status" INTEGER,
    "body" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_user_id_key_key" ON "idempotency_keys"("user_id", "key");

-- AddForeignKey
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
