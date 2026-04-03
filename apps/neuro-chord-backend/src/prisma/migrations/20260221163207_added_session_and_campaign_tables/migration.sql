-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "campaign" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
