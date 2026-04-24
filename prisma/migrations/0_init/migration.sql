-- ============================================================
-- Migration 0_init — Schema completo Invira
-- ============================================================

-- Enums
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAID', 'ARCHIVED', 'CANCELLED');
CREATE TYPE "EventType" AS ENUM ('WEDDING', 'BIRTHDAY', 'CORPORATE', 'BAPTISM', 'ANNIVERSARY', 'GRADUATION', 'QUINCEANERA', 'OTHER');
CREATE TYPE "RSVPStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED', 'MAYBE');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "InvitationStatus" AS ENUM ('DRAFT', 'SENT', 'OPENED', 'CLICKED');
CREATE TYPE "ReminderStatus" AS ENUM ('SCHEDULED', 'SENT', 'FAILED');
CREATE TYPE "CheckInStatus" AS ENUM ('PENDING', 'CHECKED_IN', 'NO_SHOW');

-- users
CREATE TABLE "users" (
  "id"               TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email"            TEXT NOT NULL UNIQUE,
  "emailVerified"    TIMESTAMP(3),
  "name"             TEXT,
  "image"            TEXT,
  "passwordHash"     TEXT,
  "role"             "UserRole" NOT NULL DEFAULT 'USER',
  "locale"           TEXT NOT NULL DEFAULT 'es',
  "timezone"         TEXT NOT NULL DEFAULT 'Europe/Madrid',
  "stripeCustomerId" TEXT UNIQUE,
  "planId"           TEXT,
  "planExpiresAt"    TIMESTAMP(3),
  "eventsCreated"    INTEGER NOT NULL DEFAULT 0,
  "isBlocked"        BOOLEAN NOT NULL DEFAULT false,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- accounts (NextAuth OAuth)
CREATE TABLE "accounts" (
  "id"                TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"            TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"              TEXT NOT NULL,
  "provider"          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token"     TEXT,
  "access_token"      TEXT,
  "expires_at"        INTEGER,
  "token_type"        TEXT,
  "scope"             TEXT,
  "id_token"          TEXT,
  "session_state"     TEXT,
  UNIQUE("provider", "providerAccountId")
);

-- sessions (NextAuth)
CREATE TABLE "sessions" (
  "id"           TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId"       TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires"      TIMESTAMP(3) NOT NULL
);

-- templates
CREATE TABLE "templates" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "thumbnail"   TEXT,
  "isPremium"   BOOLEAN NOT NULL DEFAULT false,
  "price"       DOUBLE PRECISION,
  "eventTypes"  "EventType"[],
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "schema"      JSONB NOT NULL DEFAULT '{}',
  "defaultData" JSONB NOT NULL DEFAULT '{}',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- events
CREATE TABLE "events" (
  "id"              TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"          TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "templateId"      TEXT REFERENCES "templates"("id"),
  "slug"            TEXT NOT NULL UNIQUE,
  "title"           TEXT NOT NULL,
  "type"            "EventType" NOT NULL DEFAULT 'WEDDING',
  "status"          "EventStatus" NOT NULL DEFAULT 'DRAFT',
  "eventDate"       TIMESTAMP(3) NOT NULL,
  "endDate"         TIMESTAMP(3),
  "timezone"        TEXT NOT NULL DEFAULT 'Europe/Madrid',
  "doors"           TEXT,
  "ceremony"        TEXT,
  "reception"       TEXT,
  "venueName"       TEXT,
  "venueAddress"    TEXT,
  "venueCity"       TEXT,
  "venueCountry"    TEXT DEFAULT 'ES',
  "latitude"        DOUBLE PRECISION,
  "longitude"       DOUBLE PRECISION,
  "mapboxPlaceId"   TEXT,
  "coupleNames"     TEXT,
  "description"     TEXT,
  "heroImage"       TEXT,
  "heroVideo"       TEXT,
  "musicUrl"        TEXT,
  "dressCode"       TEXT,
  "menuUrl"         TEXT,
  "agendaJson"      JSONB,
  "menuJson"        JSONB,
  "customData"      JSONB,
  "isPrivate"       BOOLEAN NOT NULL DEFAULT false,
  "privateToken"    TEXT UNIQUE,
  "privatePassword" TEXT,
  "maxGuests"       INTEGER,
  "allowPlusOne"    BOOLEAN NOT NULL DEFAULT true,
  "locale"          TEXT NOT NULL DEFAULT 'es',
  "languages"       TEXT[] DEFAULT ARRAY['es'],
  "utmSource"       TEXT,
  "utmMedium"       TEXT,
  "customDomain"    TEXT UNIQUE,
  "paidAt"          TIMESTAMP(3),
  "publishedAt"     TIMESTAMP(3),
  "archivedAt"      TIMESTAMP(3),
  "subtitle"        TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- guests
CREATE TABLE "guests" (
  "id"            TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"       TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "name"          TEXT NOT NULL,
  "email"         TEXT,
  "phone"         TEXT,
  "group"         TEXT,
  "tableNumber"   INTEGER,
  "tableName"     TEXT,
  "seat"          INTEGER,
  "accessToken"   TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  "isVIP"         BOOLEAN NOT NULL DEFAULT false,
  "menuChoice"    TEXT,
  "transportId"   TEXT,
  "notes"         TEXT,
  "checkInStatus" "CheckInStatus" NOT NULL DEFAULT 'PENDING',
  "checkedInAt"   TIMESTAMP(3),
  "checkInDevice" TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("eventId", "email")
);

-- invitations
CREATE TABLE "invitations" (
  "id"              TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"         TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "guestId"         TEXT NOT NULL UNIQUE REFERENCES "guests"("id") ON DELETE CASCADE,
  "status"          "InvitationStatus" NOT NULL DEFAULT 'DRAFT',
  "channel"         TEXT,
  "sentAt"          TIMESTAMP(3),
  "openedAt"        TIMESTAMP(3),
  "clickedAt"       TIMESTAMP(3),
  "openCount"       INTEGER NOT NULL DEFAULT 0,
  "utmSource"       TEXT,
  "utmMedium"       TEXT,
  "utmCampaign"     TEXT,
  "personalizedUrl" TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- rsvps
CREATE TABLE "rsvps" (
  "id"                  TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"             TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "guestId"             TEXT NOT NULL UNIQUE REFERENCES "guests"("id") ON DELETE CASCADE,
  "status"              "RSVPStatus" NOT NULL DEFAULT 'PENDING',
  "companions"          INTEGER NOT NULL DEFAULT 0,
  "companionNames"      TEXT[] DEFAULT ARRAY[]::TEXT[],
  "dietaryRestrictions" TEXT,
  "allergies"           TEXT,
  "customFields"        JSONB,
  "needsTransport"      BOOLEAN NOT NULL DEFAULT false,
  "transportOption"     TEXT,
  "message"             TEXT,
  "respondedAt"         TIMESTAMP(3),
  "ipAddress"           TEXT,
  "userAgent"           TEXT,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- payments
CREATE TABLE "payments" (
  "id"                  TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"              TEXT NOT NULL REFERENCES "users"("id"),
  "eventId"             TEXT NOT NULL REFERENCES "events"("id"),
  "stripeSessionId"     TEXT UNIQUE,
  "stripePaymentIntent" TEXT UNIQUE,
  "stripeInvoiceId"     TEXT,
  "amount"              DOUBLE PRECISION NOT NULL,
  "currency"            TEXT NOT NULL DEFAULT 'EUR',
  "status"              "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "productType"         TEXT NOT NULL,
  "productId"           TEXT,
  "metadata"            JSONB,
  "paidAt"              TIMESTAMP(3),
  "refundedAt"          TIMESTAMP(3),
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- analytics
CREATE TABLE "analytics" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"     TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "guestId"     TEXT REFERENCES "guests"("id") ON DELETE SET NULL,
  "type"        TEXT NOT NULL,
  "channel"     TEXT,
  "utmSource"   TEXT,
  "utmMedium"   TEXT,
  "utmCampaign" TEXT,
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "country"     TEXT,
  "city"        TEXT,
  "referrer"    TEXT,
  "sessionId"   TEXT,
  "duration"    INTEGER,
  "metadata"    JSONB,
  "timestamp"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "analytics_eventId_timestamp_idx" ON "analytics"("eventId", "timestamp");
CREATE INDEX "analytics_guestId_idx" ON "analytics"("guestId");

-- messages
CREATE TABLE "messages" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"     TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "authorName"  TEXT NOT NULL,
  "authorEmail" TEXT,
  "content"     TEXT NOT NULL,
  "isApproved"  BOOLEAN NOT NULL DEFAULT false,
  "isPinned"    BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- media
CREATE TABLE "media" (
  "id"         TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"    TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "url"        TEXT NOT NULL,
  "publicId"   TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "width"      INTEGER,
  "height"     INTEGER,
  "size"       INTEGER,
  "alt"        TEXT,
  "caption"    TEXT,
  "position"   INTEGER NOT NULL DEFAULT 0,
  "isHero"     BOOLEAN NOT NULL DEFAULT false,
  "uploadedBy" TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- songs
CREATE TABLE "songs" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"     TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "title"       TEXT NOT NULL,
  "artist"      TEXT NOT NULL,
  "spotifyId"   TEXT,
  "youtubeId"   TEXT,
  "coverUrl"    TEXT,
  "suggestedBy" TEXT,
  "votes"       INTEGER NOT NULL DEFAULT 0,
  "isApproved"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- gifts
CREATE TABLE "gifts" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"     TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "price"       DOUBLE PRECISION,
  "url"         TEXT,
  "imageUrl"    TEXT,
  "isTaken"     BOOLEAN NOT NULL DEFAULT false,
  "takenBy"     TEXT,
  "takenAt"     TIMESTAMP(3),
  "position"    INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- hotels
CREATE TABLE "hotels" (
  "id"         TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"    TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "name"       TEXT NOT NULL,
  "address"    TEXT,
  "stars"      INTEGER,
  "priceRange" TEXT,
  "url"        TEXT,
  "phone"      TEXT,
  "imageUrl"   TEXT,
  "distance"   DOUBLE PRECISION,
  "discount"   TEXT,
  "position"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- transport
CREATE TABLE "transport" (
  "id"            TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"       TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "name"          TEXT NOT NULL,
  "type"          TEXT NOT NULL,
  "origin"        TEXT NOT NULL,
  "destination"   TEXT,
  "departureTime" TEXT,
  "returnTime"    TEXT,
  "capacity"      INTEGER,
  "notes"         TEXT,
  "contactPhone"  TEXT,
  "position"      INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- reminders
CREATE TABLE "reminders" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"     TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "type"        TEXT NOT NULL,
  "triggerDays" INTEGER NOT NULL,
  "subject"     TEXT,
  "template"    TEXT,
  "status"      "ReminderStatus" NOT NULL DEFAULT 'SCHEDULED',
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "sentAt"      TIMESTAMP(3),
  "sentCount"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- timeline_items
CREATE TABLE "timeline_items" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"     TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "date"        TIMESTAMP(3),
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "imageUrl"    TEXT,
  "icon"        TEXT NOT NULL DEFAULT '✦',
  "position"    INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- instagram_posts
CREATE TABLE "instagram_posts" (
  "id"           TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId"      TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "hashtag"      TEXT,
  "imageUrl"     TEXT NOT NULL,
  "caption"      TEXT,
  "authorName"   TEXT,
  "authorHandle" TEXT,
  "isApproved"   BOOLEAN NOT NULL DEFAULT false,
  "instagramId"  TEXT,
  "postedAt"     TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

