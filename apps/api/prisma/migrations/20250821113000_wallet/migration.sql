-- CreateEnum
CREATE TYPE "CryptoAsset" AS ENUM ('BTC', 'ETH', 'USDT', 'USDC', 'DOGE', 'SOL');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'FEE');

-- CreateEnum
CREATE TYPE "WalletTransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'COINBASE', 'INTERNAL');

-- CreateEnum
CREATE TYPE "BankAccountStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('HELD', 'RELEASED', 'REFUNDED', 'DISPUTED');

-- CreateTable
CREATE TABLE "fiat_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "available_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "pending_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fiat_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "encrypted_account_number" TEXT NOT NULL,
    "encrypted_routing_number" TEXT,
    "last4" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "BankAccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verification_token_hash" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_deposit_addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asset" "CryptoAsset" NOT NULL,
    "address" TEXT NOT NULL,
    "provider_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crypto_deposit_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "status" "WalletTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(14,2) NOT NULL,
    "fee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "crypto_asset" "CryptoAsset",
    "crypto_amount" DECIMAL(18,8),
    "provider" "PaymentProvider" NOT NULL DEFAULT 'INTERNAL',
    "provider_reference_id" TEXT,
    "counterparty_user_id" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "escrow_id" TEXT,
    "idempotency_key" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_holds" (
    "id" TEXT NOT NULL,
    "payer_id" TEXT NOT NULL,
    "payee_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "fee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "EscrowStatus" NOT NULL DEFAULT 'HELD',
    "reference_type" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "release_note" TEXT,
    "held_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escrow_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "risk_score" INTEGER NOT NULL DEFAULT 0,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fiat_wallets_user_id_key" ON "fiat_wallets"("user_id");

-- CreateIndex
CREATE INDEX "bank_accounts_user_id_is_default_idx" ON "bank_accounts"("user_id", "is_default");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_deposit_addresses_user_id_asset_key" ON "crypto_deposit_addresses"("user_id", "asset");

-- CreateIndex
CREATE INDEX "crypto_deposit_addresses_address_idx" ON "crypto_deposit_addresses"("address");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_idempotency_key_key" ON "wallet_transactions"("idempotency_key");

-- CreateIndex
CREATE INDEX "wallet_transactions_user_id_created_at_idx" ON "wallet_transactions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "wallet_transactions_status_type_idx" ON "wallet_transactions"("status", "type");

-- CreateIndex
CREATE INDEX "escrow_holds_payer_id_status_idx" ON "escrow_holds"("payer_id", "status");

-- CreateIndex
CREATE INDEX "escrow_holds_payee_id_status_idx" ON "escrow_holds"("payee_id", "status");

-- CreateIndex
CREATE INDEX "escrow_holds_reference_type_reference_id_idx" ON "escrow_holds"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "fraud_logs_user_id_created_at_idx" ON "fraud_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "fraud_logs_action_created_at_idx" ON "fraud_logs"("action", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "fiat_wallets" ADD CONSTRAINT "fiat_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_deposit_addresses" ADD CONSTRAINT "crypto_deposit_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_holds" ADD CONSTRAINT "escrow_holds_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_holds" ADD CONSTRAINT "escrow_holds_payee_id_fkey" FOREIGN KEY ("payee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_logs" ADD CONSTRAINT "fraud_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
