-- CreateTable
CREATE TABLE "email_outbox" (
    "id" SERIAL NOT NULL,
    "kind" TEXT NOT NULL,
    "order_id" INTEGER,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_outbox_kind_order_id_key" ON "email_outbox"("kind", "order_id");
