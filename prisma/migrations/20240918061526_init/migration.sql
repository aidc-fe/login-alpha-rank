-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "shopDisplayName" TEXT,
ADD COLUMN     "shopDomain" TEXT,
ADD COLUMN     "userName" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "from" TEXT,
ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "name" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "redirect_uris" TEXT NOT NULL,
    "grant_types" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "name" TEXT,
    "description" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorizationCode" (
    "code" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "redirect_uri" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL,

    CONSTRAINT "AuthorizationCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "AccessToken" (
    "token" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refresh_token" TEXT,

    CONSTRAINT "AccessToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "token" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_client_id_key" ON "Client"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorizationCode_code_key" ON "AuthorizationCode"("code");

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_identifier_fkey" FOREIGN KEY ("identifier") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorizationCode" ADD CONSTRAINT "AuthorizationCode_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorizationCode" ADD CONSTRAINT "AuthorizationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessToken" ADD CONSTRAINT "AccessToken_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessToken" ADD CONSTRAINT "AccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
