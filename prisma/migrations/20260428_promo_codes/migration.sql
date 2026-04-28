-- PromoCode table
CREATE TABLE "promo_codes" (
  "id"             TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "code"           TEXT NOT NULL UNIQUE,
  "description"    TEXT,
  "discountType"   TEXT NOT NULL,
  "discountValue"  DOUBLE PRECISION NOT NULL,
  "appliesTo"      TEXT NOT NULL DEFAULT 'all',
  "minAmount"      DOUBLE PRECISION,
  "maxUses"        INTEGER,
  "usedCount"      INTEGER NOT NULL DEFAULT 0,
  "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1,
  "validFrom"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil"     TIMESTAMP(3),
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PromoCodeUse table
CREATE TABLE "promo_code_uses" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "promoCodeId" TEXT NOT NULL REFERENCES "promo_codes"("id"),
  "userId"      TEXT NOT NULL REFERENCES "users"("id"),
  "paymentId"   TEXT,
  "discount"    DOUBLE PRECISION NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "promo_code_uses_promoCodeId_idx" ON "promo_code_uses"("promoCodeId");
CREATE INDEX "promo_code_uses_userId_idx" ON "promo_code_uses"("userId");
