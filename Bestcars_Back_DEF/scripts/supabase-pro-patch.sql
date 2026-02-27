-- ============================================================
-- BestCars - SUPABASE PRO PATCH (single script, copy/paste)
-- - Upgrades existing tables safely (ADD COLUMN IF NOT EXISTS)
-- - Adds constraints/indices/triggers
-- - Adds scenes table (required for scenes/hotspots)
-- Idempotent: safe to run multiple times
-- Compatible with Prisma schema (Bestcars_Back_DEF)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- updated_at helper (safe search_path)
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- VEHICLES: create if missing + upgrade if exists
-- ============================================================

create table if not exists public.vehicles (
  id             text primary key,
  title          text not null,
  year           int  not null,
  mileage        text not null,
  price          text not null,
  price_subtext  text,
  fuel_type      text,
  seats          text,
  description    text,
  images         text[] not null default '{}'::text[],
  tags           text[] not null default '{}'::text[],
  specifications jsonb,
  status         text not null default 'available',
  priority       int  not null default 0,
  views          int  not null default 0,
  clicks         int  not null default 0,
  leads          int  not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- upgrade existing schema (no-op if already present)
alter table public.vehicles
  add column if not exists price_subtext text,
  add column if not exists fuel_type text,
  add column if not exists seats text,
  add column if not exists description text,
  add column if not exists images text[] not null default '{}'::text[],
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists specifications jsonb,
  add column if not exists status text not null default 'available',
  add column if not exists priority int not null default 0,
  add column if not exists views int not null default 0,
  add column if not exists clicks int not null default 0,
  add column if not exists leads int not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- updated_at trigger
drop trigger if exists trg_vehicles_updated_at on public.vehicles;
create trigger trg_vehicles_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

-- constraints (only add if missing)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'vehicles_year_check') then
    alter table public.vehicles
      add constraint vehicles_year_check
      check (year between 1900 and (extract(year from now())::int + 1));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'vehicles_priority_check') then
    alter table public.vehicles
      add constraint vehicles_priority_check
      check (priority >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'vehicles_metrics_check') then
    alter table public.vehicles
      add constraint vehicles_metrics_check
      check (views >= 0 and clicks >= 0 and leads >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'vehicles_status_check') then
    alter table public.vehicles
      add constraint vehicles_status_check
      check (status in ('available','reserved','sold','hidden'));
  end if;
end $$;

-- indices
create index if not exists vehicles_status_idx on public.vehicles(status);
create index if not exists vehicles_priority_idx on public.vehicles(priority desc);
create index if not exists vehicles_created_at_idx on public.vehicles(created_at desc);
create index if not exists vehicles_year_idx on public.vehicles(year desc);
create index if not exists vehicles_tags_gin_idx on public.vehicles using gin (tags);

-- ============================================================
-- SCENES: required for scenes/hotspots (Prisma stores array in positions)
-- ============================================================

create table if not exists public.scenes (
  id             text primary key,
  name           text not null,
  background_url text not null default '',
  positions      jsonb not null default '[]'::jsonb,
  is_active      boolean not null default false,
  "order"        int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- upgrade (safe)
alter table public.scenes
  add column if not exists name text,
  add column if not exists background_url text,
  add column if not exists positions jsonb not null default '[]'::jsonb,
  add column if not exists is_active boolean not null default false,
  add column if not exists "order" int not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- ensure positions default is array for new rows (Prisma writes hotspot arrays)
alter table public.scenes alter column positions set default '[]'::jsonb;

drop trigger if exists trg_scenes_updated_at on public.scenes;
create trigger trg_scenes_updated_at
before update on public.scenes
for each row execute function public.set_updated_at();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'scenes_order_check') then
    alter table public.scenes
      add constraint scenes_order_check
      check ("order" >= 0);
  end if;
end $$;

create index if not exists scenes_order_idx on public.scenes("order");
create index if not exists scenes_active_idx on public.scenes(is_active);

-- only 1 active scene
create unique index if not exists scenes_single_active_idx
on public.scenes (is_active)
where is_active;

-- ============================================================
-- SPECIFICATION CATEGORIES + SPECIFICATIONS (optional but PRO)
-- ============================================================

create table if not exists public.specification_categories (
  id           text primary key default (gen_random_uuid()::text),
  name         text not null unique,
  display_name text not null,
  icon         text,
  "order"      int  not null default 0,
  created_at   timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'spec_cat_order_check') then
    alter table public.specification_categories
      add constraint spec_cat_order_check
      check ("order" >= 0);
  end if;
end $$;

create index if not exists spec_cat_order_idx on public.specification_categories("order");

create table if not exists public.specifications (
  id          text primary key default (gen_random_uuid()::text),
  vehicle_id  text not null,
  category_id text not null,
  key         text not null,
  value       text not null,
  "order"     int  not null default 0,
  created_at  timestamptz not null default now(),

  constraint specs_vehicle_fk
    foreign key (vehicle_id) references public.vehicles(id)
    on delete cascade,

  constraint specs_category_fk
    foreign key (category_id) references public.specification_categories(id)
    on delete cascade
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'spec_order_check') then
    alter table public.specifications
      add constraint spec_order_check
      check ("order" >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'spec_unique_per_vehicle_category_key') then
    alter table public.specifications
      add constraint spec_unique_per_vehicle_category_key
      unique (vehicle_id, category_id, key);
  end if;
end $$;

create index if not exists specs_vehicle_idx on public.specifications(vehicle_id);
create index if not exists specs_category_idx on public.specifications(category_id);
create index if not exists specs_vehicle_category_order_idx on public.specifications(vehicle_id, category_id, "order");

-- ============================================================
-- CONTACT SUBMISSIONS
-- ============================================================

create table if not exists public.contact_submissions (
  id         integer generated by default as identity primary key,
  vehicle_id text,
  name       text not null,
  email      text not null,
  phone      text,
  message    text,
  status     text not null default 'new',
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint contact_vehicle_fk
    foreign key (vehicle_id) references public.vehicles(id)
    on delete set null
);

alter table public.contact_submissions
  add column if not exists vehicle_id text,
  add column if not exists phone text,
  add column if not exists message text,
  add column if not exists status text not null default 'new',
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_contact_updated_at on public.contact_submissions;
create trigger trg_contact_updated_at
before update on public.contact_submissions
for each row execute function public.set_updated_at();

create index if not exists contact_vehicle_idx on public.contact_submissions(vehicle_id);
create index if not exists contact_status_created_idx on public.contact_submissions(status, created_at desc);
create index if not exists contact_email_lower_idx on public.contact_submissions((lower(email)));

-- ============================================================
-- TEST DRIVE SUBMISSIONS
-- ============================================================

create table if not exists public.test_drive_submissions (
  id            integer generated by default as identity primary key,
  vehicle_id    text,
  vehicle_title text,
  name          text not null,
  age           text not null,
  last_vehicle  text not null,
  interests     text not null,
  main_use      text not null,
  status        text not null default 'new',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint testdrive_vehicle_fk
    foreign key (vehicle_id) references public.vehicles(id)
    on delete set null
);

alter table public.test_drive_submissions
  add column if not exists vehicle_id text,
  add column if not exists vehicle_title text,
  add column if not exists status text not null default 'new',
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_testdrive_updated_at on public.test_drive_submissions;
create trigger trg_testdrive_updated_at
before update on public.test_drive_submissions
for each row execute function public.set_updated_at();

create index if not exists testdrive_vehicle_idx on public.test_drive_submissions(vehicle_id);
create index if not exists testdrive_status_created_idx on public.test_drive_submissions(status, created_at desc);

-- ============================================================
-- Notes:
-- - If scenes_single_active_idx fails (multiple rows with is_active=true),
--   run first: UPDATE public.scenes SET is_active = false;
--   then set one active: UPDATE public.scenes SET is_active = true WHERE id = 'your-scene-id';
-- ============================================================
