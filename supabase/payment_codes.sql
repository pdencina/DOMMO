-- ============================================================
-- DOMMO — Códigos de pago para unidades
-- Formato: primeras 2 letras del slug + número de unidad
-- Ej: Edificio "laspalmas" depto "101" → LP-101
-- ============================================================

-- 1. Agregar columna payment_code a units
ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS payment_code text UNIQUE;

-- 2. Función que genera el código automáticamente
CREATE OR REPLACE FUNCTION public.generate_payment_code(
  p_building_id uuid,
  p_unit_number text
)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_slug     text;
  v_prefix   text;
  v_code     text;
  v_attempt  int := 0;
BEGIN
  -- Obtener slug del edificio
  SELECT slug INTO v_slug FROM public.buildings WHERE id = p_building_id;
  
  -- Prefijo: primeras 2 letras en mayúscula
  v_prefix := UPPER(LEFT(REGEXP_REPLACE(v_slug, '[^a-zA-Z]', '', 'g'), 2));
  
  -- Código base
  v_code := v_prefix || '-' || UPPER(p_unit_number);
  
  -- Si existe, agregar sufijo numérico
  WHILE EXISTS (SELECT 1 FROM public.units WHERE payment_code = v_code) LOOP
    v_attempt := v_attempt + 1;
    v_code := v_prefix || '-' || UPPER(p_unit_number) || '-' || v_attempt;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- 3. Trigger: genera el código automáticamente al insertar una unidad
CREATE OR REPLACE FUNCTION public.auto_payment_code()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.payment_code IS NULL THEN
    NEW.payment_code := public.generate_payment_code(NEW.building_id, NEW.number);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_payment_code ON public.units;
CREATE TRIGGER trg_auto_payment_code
  BEFORE INSERT ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.auto_payment_code();

-- 4. Generar códigos para unidades existentes que no tienen
UPDATE public.units
SET payment_code = public.generate_payment_code(building_id, number)
WHERE payment_code IS NULL;

-- 5. Índice para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS idx_units_payment_code 
  ON public.units(payment_code);

-- Política RLS: cualquiera puede buscar por código (para pago público)
CREATE POLICY "busqueda publica por payment_code" ON public.units
  FOR SELECT USING (payment_code IS NOT NULL);

-- Verificación
SELECT 
  u.number,
  u.payment_code,
  b.name AS edificio
FROM public.units u
JOIN public.buildings b ON b.id = u.building_id
ORDER BY b.name, u.number;
