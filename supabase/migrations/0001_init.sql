-- Fichaqui: schema inicial
-- Tablas, triggers, RLS y policies

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  apellido text not null default '',
  email text not null unique,
  rol text not null check (rol in ('admin', 'employee')) default 'employee',
  cargo text not null default '',
  rubro text not null default '',
  jornada_inicio time not null default '09:00',
  jornada_fin time not null default '18:00',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  fecha date not null default current_date,
  entrada_at timestamptz,
  salida_at timestamptz,
  entrada_lat numeric,
  entrada_lng numeric,
  salida_lat numeric,
  salida_lng numeric,
  estado text not null check (estado in ('sin_registrar', 'trabajando', 'finalizada')) default 'sin_registrar',
  horas_trabajadas numeric,
  llegada_tarde boolean not null default false,
  minutos_tarde integer not null default 0,
  created_at timestamptz not null default now(),
  unique (employee_id, fecha)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, apellido, email, cargo, rubro, jornada_inicio, jornada_fin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', 'Empleado'),
    coalesce(new.raw_user_meta_data ->> 'apellido', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'cargo', ''),
    coalesce(new.raw_user_meta_data ->> 'rubro', ''),
    coalesce((new.raw_user_meta_data ->> 'jornada_inicio')::time, '09:00'),
    coalesce((new.raw_user_meta_data ->> 'jornada_fin')::time, '18:00')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.attendance_records enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and rol = 'admin');
$$;

create policy "profile own or admin read" on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy "employee own attendance read" on public.attendance_records for select to authenticated
using (employee_id = auth.uid() or public.is_admin());

-- Las escrituras de asistencia solo ocurren a través de las Edge Functions
-- (check-in / check-out) con service_role, que ignora RLS. Por eso no se
-- exponen policies de insert/update directas para attendance_records.

alter publication supabase_realtime add table public.attendance_records;
