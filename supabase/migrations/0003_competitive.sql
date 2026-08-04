-- Fichaqui: features competitivas
-- Sucursales (geofencing), turnos, licencias/ausencias, notificaciones (alertas),
-- horas extras y observación en la fichada.

-- Sucursales (sitios de trabajo para geofencing)
create table public.sucursales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text not null default '',
  codigo text not null unique,
  lat numeric,
  lng numeric,
  radio_m integer not null default 200,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Turnos
create table public.turnos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  jornada_inicio time not null,
  jornada_fin time not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Licencias / ausencias
create table public.licencias (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null default 'personal',
  fecha_inicio date not null,
  fecha_fin date not null,
  motivo text not null default '',
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aprobada', 'rechazada')),
  revisado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Notificaciones (alertas para el admin)
create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null default 'aviso',
  mensaje text not null,
  leida boolean not null default false,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

-- Columnas nuevas en profiles (sucursal asignada, turno asignado, pin de fichaje)
alter table public.profiles
  add column sucursal_id uuid references public.sucursales(id) on delete set null,
  add column turno_id uuid references public.turnos(id) on delete set null,
  add column pin text;

-- Columnas nuevas en attendance_records (horas extra, observación)
alter table public.attendance_records
  add column horas_extra numeric,
  add column observacion text;

-- RLS
alter table public.sucursales enable row level security;
alter table public.turnos enable row level security;
alter table public.licencias enable row level security;
alter table public.notificaciones enable row level security;

-- Sucursales y turnos: admin gestiona, empleados solo leen
create policy "sucursales admin manage" on public.sucursales
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "sucursales employee read" on public.sucursales
  for select to authenticated using (true);

create policy "turnos admin manage" on public.turnos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "turnos employee read" on public.turnos
  for select to authenticated using (true);

-- Licencias: el empleado crea y ve las suyas, el admin ve y aprueba todas
create policy "licencias owner read" on public.licencias
  for select to authenticated using (employee_id = auth.uid() or public.is_admin());

create policy "licencias owner insert" on public.licencias
  for insert to authenticated with check (employee_id = auth.uid());

create policy "licencias admin update" on public.licencias
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Notificaciones: solo admin las lee y actualiza
create policy "notificaciones admin read" on public.notificaciones
  for select to authenticated using (public.is_admin());

create policy "notificaciones admin update" on public.notificaciones
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Realtime para las alertas del admin
alter publication supabase_realtime add table public.notificaciones;
