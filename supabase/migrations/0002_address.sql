-- Fichaqui: direcciones de fichada
-- Guarda la dirección (reverse geocode) de entrada y salida

alter table public.attendance_records
  add column entrada_direccion text,
  add column salida_direccion text;
