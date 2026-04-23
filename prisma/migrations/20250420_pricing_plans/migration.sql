CREATE TABLE "pricing_plans" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "slug"        TEXT NOT NULL UNIQUE,
  "name"        TEXT NOT NULL,
  "price"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "maxEvents"   INTEGER NOT NULL DEFAULT 0,
  "maxGuests"   INTEGER NOT NULL DEFAULT 300,
  "features"    JSONB NOT NULL DEFAULT '[]',
  "notFeatures" JSONB NOT NULL DEFAULT '[]',
  "discount"    JSONB,
  "badge"       TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed default plans
INSERT INTO "pricing_plans" ("id","slug","name","price","maxEvents","maxGuests","features","notFeatures","badge","sortOrder") VALUES
  ('plan_free',    'free',     'Preview',  0,  0, 0,
   '["Editor visual completo","Generación de texto con IA","Vista previa ilimitada","Múltiples borradores"]',
   '["Enlace público activo","RSVP de invitados","Analytics"]',
   NULL, 0),
  ('plan_esencial','esencial', 'Esencial', 29, 1, 300,
   '["1 evento publicado","RSVP ilimitado","Hasta 300 invitados","QR Check-in","Analytics básicos","Enlace personalizable","Música de fondo"]',
   '["Invitados ilimitados","Analytics avanzados","Dominio personalizado","Recordatorios automáticos"]',
   NULL, 1),
  ('plan_premium', 'premium',  'Premium',  59, 3, -1,
   '["Hasta 3 eventos publicados","Invitados ilimitados","Analytics avanzados","Dominio personalizado","Recordatorios automáticos","Soporte prioritario","Todo de Esencial incluido"]',
   '[]',
   'Más popular', 2);
