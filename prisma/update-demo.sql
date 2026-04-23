-- Actualiza la invitación demo con foto, música y diseño
-- Ejecutar con: npx prisma db execute --file prisma/update-demo.sql

UPDATE events SET
  "heroImage" = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85&auto=format&fit=crop',
  "musicUrl"  = 'youtube:ZbZSe6N_BXs',
  "customData" = '{"design":{"colorPrimary":"#1e2d1f","colorAccent":"#b8966e","colorBackground":"#faf8f4","fontDisplay":"Playfair Display","fontBody":"Inter"}}'::jsonb
WHERE slug = 'sofia-y-miguel-2025';
