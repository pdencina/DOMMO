-- ============================================================
-- DOMMO — Tabla de distribuciones (liquidaciones)
-- Registra cada pago online y la distribución de fondos
-- ============================================================

CREATE TABLE IF NOT EXISTS public.distributions (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id      uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  payment_id       uuid NOT NULL REFERENCES public.payments(id)  ON DELETE CASCADE,

  -- Montos
  gross_amount     numeric(12,2) NOT NULL,  -- Lo que pagó el residente
  commission_pct   numeric(5,4)  NOT NULL DEFAULT 0.019,  -- 1.9%
  commission_iva   numeric(5,4)  NOT NULL DEFAULT 0.19,   -- IVA 19%
  commission_net   numeric(12,2) NOT NULL,  -- Comisión sin IVA
  commission_total numeric(12,2) NOT NULL,  -- Comisión + IVA
  net_amount       numeric(12,2) NOT NULL,  -- Lo que recibe el edificio

  -- Estado de liquidación
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','transferred','cancelled')),
  transferred_at   timestamptz,
  transfer_ref     text,   -- Referencia de la transferencia bancaria
  transfer_notes   text,

  -- Datos de Transbank
  tbk_buy_order        text,
  tbk_auth_code        text,
  tbk_card_last_digits text,
  tbk_payment_type     text,

  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),

  UNIQUE(payment_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_distributions_building  ON public.distributions(building_id);
CREATE INDEX IF NOT EXISTS idx_distributions_status    ON public.distributions(status);
CREATE INDEX IF NOT EXISTS idx_distributions_created   ON public.distributions(created_at DESC);

-- RLS
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmin gestiona distribuciones" ON public.distributions
  FOR ALL USING (public.is_superadmin());

CREATE POLICY "admin ve distribuciones de su edificio" ON public.distributions
  FOR SELECT USING (building_id = public.my_building_id());

-- ============================================================
-- FUNCIÓN: calcular distribución automáticamente
-- Se llama desde la API al confirmar un pago WebPay
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_distribution(
  p_payment_id       uuid,
  p_tbk_buy_order    text,
  p_tbk_auth_code    text,
  p_tbk_card_digits  text,
  p_tbk_payment_type text
)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  v_payment        public.payments%ROWTYPE;
  v_commission_pct numeric := 0.019;
  v_iva_pct        numeric := 0.19;
  v_commission_net numeric;
  v_commission_iva numeric;
  v_commission_ttl numeric;
  v_net_amount     numeric;
  v_dist_id        uuid;
BEGIN
  SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pago % no encontrado', p_payment_id; END IF;

  v_commission_net := ROUND(v_payment.amount * v_commission_pct, 0);
  v_commission_iva := ROUND(v_commission_net * v_iva_pct, 0);
  v_commission_ttl := v_commission_net + v_commission_iva;
  v_net_amount     := v_payment.amount - v_commission_ttl;

  INSERT INTO public.distributions (
    building_id, payment_id,
    gross_amount, commission_pct, commission_iva,
    commission_net, commission_total, net_amount,
    status, tbk_buy_order, tbk_auth_code,
    tbk_card_last_digits, tbk_payment_type
  ) VALUES (
    v_payment.building_id, p_payment_id,
    v_payment.amount, v_commission_pct, v_iva_pct,
    v_commission_net, v_commission_ttl, v_net_amount,
    'pending', p_tbk_buy_order, p_tbk_auth_code,
    p_tbk_card_digits, p_tbk_payment_type
  )
  ON CONFLICT (payment_id) DO NOTHING
  RETURNING id INTO v_dist_id;

  RETURN v_dist_id;
END;
$$;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 'distributions table created' AS status;
