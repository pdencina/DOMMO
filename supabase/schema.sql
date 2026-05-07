-- ============================================================
-- HOGAR APP — Supabase Schema
-- Multi-tenant: cada edificio es un "building" aislado
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLA: buildings (edificios / clientes)
-- ============================================================
create table public.buildings (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,           -- "laspalmas" → laspalmas.hogarapp.cl
  name        text not null,                  -- "Condominio Las Palmas"
  address     text,
  city        text default 'Santiago',
  total_units int default 0,
  plan        text default 'pro' check (plan in ('basico','pro','premium')),
  status      text default 'trial' check (status in ('trial','active','suspended','cancelled')),
  trial_ends_at timestamptz default (now() + interval '30 days'),
  billing_day int default 5,                  -- día del mes que se cobra
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABLA: profiles (usuarios = admins + residentes)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  building_id uuid references public.buildings(id) on delete set null,
  full_name   text,
  email       text,
  phone       text,
  role        text default 'resident' check (role in ('superadmin','admin','resident')),
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABLA: units (departamentos / unidades)
-- ============================================================
create table public.units (
  id          uuid primary key default uuid_generate_v4(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  number      text not null,                  -- "3B", "12A"
  floor       int,
  type        text default 'apartment',       -- apartment, parking, storage
  area_m2     numeric(6,2),
  owner_id    uuid references public.profiles(id) on delete set null,
  resident_id uuid references public.profiles(id) on delete set null,
  is_occupied boolean default true,
  created_at  timestamptz default now(),
  unique(building_id, number)
);

-- ============================================================
-- TABLA: fee_periods (períodos de gasto común)
-- ============================================================
create table public.fee_periods (
  id          uuid primary key default uuid_generate_v4(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  period_month date not null,                 -- primer día del mes: 2026-05-01
  amount      numeric(12,2) not null,         -- monto base por unidad
  due_date    date not null,                  -- fecha límite de pago
  notes       text,
  created_at  timestamptz default now(),
  unique(building_id, period_month)
);

-- ============================================================
-- TABLA: payments (pagos individuales por unidad)
-- ============================================================
create table public.payments (
  id            uuid primary key default uuid_generate_v4(),
  building_id   uuid not null references public.buildings(id) on delete cascade,
  unit_id       uuid not null references public.units(id) on delete cascade,
  period_id     uuid not null references public.fee_periods(id) on delete cascade,
  amount        numeric(12,2) not null,
  status        text default 'pending' check (status in ('pending','paid','overdue','waived')),
  paid_at       timestamptz,
  payment_method text,                        -- 'transfer','webpay','cash'
  receipt_url   text,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(unit_id, period_id)
);

-- ============================================================
-- TABLA: alerts (alertas automáticas de morosidad)
-- ============================================================
create table public.alerts (
  id          uuid primary key default uuid_generate_v4(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  unit_id     uuid references public.units(id) on delete cascade,
  payment_id  uuid references public.payments(id) on delete cascade,
  type        text not null check (type in ('overdue','due_soon','payment_received','maintenance','notice')),
  title       text not null,
  message     text,
  is_read     boolean default false,
  sent_at     timestamptz,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLA: maintenances (mantenciones)
-- ============================================================
create table public.maintenances (
  id          uuid primary key default uuid_generate_v4(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  title       text not null,
  description text,
  category    text default 'general',         -- ascensor, electrico, jardineria, etc
  status      text default 'pending' check (status in ('pending','in_progress','done','cancelled')),
  priority    text default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_to text,                           -- nombre del proveedor
  estimated_cost numeric(12,2),
  actual_cost    numeric(12,2),
  scheduled_date date,
  completed_at   timestamptz,
  reported_by    uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABLA: notices (avisos / comunicados)
-- ============================================================
create table public.notices (
  id          uuid primary key default uuid_generate_v4(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  author_id   uuid references public.profiles(id),
  title       text not null,
  body        text not null,
  category    text default 'general',         -- general, urgent, event, rule
  pinned      boolean default false,
  published_at timestamptz default now(),
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLA: bookings (reservas de espacios comunes)
-- ============================================================
create table public.bookings (
  id          uuid primary key default uuid_generate_v4(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  unit_id     uuid references public.units(id),
  space       text not null,                  -- 'salon','piscina','quincho','gym'
  date        date not null,
  start_time  time not null,
  end_time    time not null,
  status      text default 'confirmed' check (status in ('pending','confirmed','cancelled')),
  notes       text,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLA: expenses (egresos / gastos del edificio)
-- ============================================================
create table public.expenses (
  id          uuid primary key default uuid_generate_v4(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  category    text not null,                  -- 'agua','luz','gas','personal','mantencion'
  description text not null,
  amount      numeric(12,2) not null,
  expense_date date not null,
  receipt_url text,
  approved_by uuid references public.profiles(id),
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Cada usuario solo ve datos de SU edificio
-- ============================================================

alter table public.buildings      enable row level security;
alter table public.profiles       enable row level security;
alter table public.units          enable row level security;
alter table public.fee_periods    enable row level security;
alter table public.payments       enable row level security;
alter table public.alerts         enable row level security;
alter table public.maintenances   enable row level security;
alter table public.notices        enable row level security;
alter table public.bookings       enable row level security;
alter table public.expenses       enable row level security;

-- Helper: obtener building_id del usuario actual
create or replace function public.my_building_id()
returns uuid language sql stable as $$
  select building_id from public.profiles where id = auth.uid()
$$;

-- Helper: es superadmin?
create or replace function public.is_superadmin()
returns boolean language sql stable as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'superadmin')
$$;

-- Helper: es admin del edificio?
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('superadmin','admin'))
$$;

-- POLICIES: buildings
create policy "superadmin ve todos los edificios" on public.buildings
  for all using (public.is_superadmin());
create policy "admin ve su edificio" on public.buildings
  for select using (id = public.my_building_id());

-- POLICIES: profiles
create policy "usuario ve perfiles de su edificio" on public.profiles
  for select using (building_id = public.my_building_id() or id = auth.uid());
create policy "superadmin gestiona perfiles" on public.profiles
  for all using (public.is_superadmin());
create policy "admin gestiona perfiles de su edificio" on public.profiles
  for all using (building_id = public.my_building_id() and public.is_admin());

-- POLICIES genéricas por building_id (aplica a units, payments, etc.)
create policy "aislamiento por edificio - units" on public.units
  for all using (building_id = public.my_building_id() or public.is_superadmin());
create policy "aislamiento por edificio - fee_periods" on public.fee_periods
  for all using (building_id = public.my_building_id() or public.is_superadmin());
create policy "aislamiento por edificio - payments" on public.payments
  for all using (building_id = public.my_building_id() or public.is_superadmin());
create policy "aislamiento por edificio - alerts" on public.alerts
  for all using (building_id = public.my_building_id() or public.is_superadmin());
create policy "aislamiento por edificio - maintenances" on public.maintenances
  for all using (building_id = public.my_building_id() or public.is_superadmin());
create policy "aislamiento por edificio - notices" on public.notices
  for all using (building_id = public.my_building_id() or public.is_superadmin());
create policy "aislamiento por edificio - bookings" on public.bookings
  for all using (building_id = public.my_building_id() or public.is_superadmin());
create policy "aislamiento por edificio - expenses" on public.expenses
  for all using (building_id = public.my_building_id() or public.is_superadmin());

-- ============================================================
-- FUNCIÓN: auto-crear alertas cuando un pago vence
-- ============================================================
create or replace function public.auto_alert_overdue()
returns void language plpgsql as $$
begin
  -- Marcar pagos vencidos
  update public.payments p
  set status = 'overdue', updated_at = now()
  from public.fee_periods fp
  where p.period_id = fp.id
    and p.status = 'pending'
    and fp.due_date < current_date;

  -- Crear alertas para los vencidos sin alerta
  insert into public.alerts (building_id, unit_id, payment_id, type, title, message)
  select
    p.building_id,
    p.unit_id,
    p.id,
    'overdue',
    'Pago vencido',
    'El gasto común de la unidad ' || u.number || ' está vencido desde ' || fp.due_date::text
  from public.payments p
  join public.units u on u.id = p.unit_id
  join public.fee_periods fp on fp.id = p.period_id
  where p.status = 'overdue'
    and not exists (
      select 1 from public.alerts a
      where a.payment_id = p.id and a.type = 'overdue'
    );
end;
$$;

-- ============================================================
-- DATOS DE EJEMPLO (seed)
-- ============================================================
-- Insertar un edificio de demo
insert into public.buildings (slug, name, address, total_units, plan, status)
values ('laspalmas', 'Condominio Las Palmas', 'Av. Las Condes 1234, Santiago', 48, 'pro', 'active');
