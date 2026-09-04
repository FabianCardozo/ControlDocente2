-- CDT — Control Docente Total
-- Ejecutar en Supabase SQL Editor antes de activar la sincronización.

create table if not exists public.cdt_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  version integer not null default 4,
  updated_at timestamptz not null default now()
);

alter table public.cdt_user_data enable row level security;

revoke all on table public.cdt_user_data from anon;
grant select, insert, update, delete on table public.cdt_user_data to authenticated;

create policy "Cada docente puede leer sus datos"
on public.cdt_user_data for select
to authenticated
using (auth.uid() = user_id);

create policy "Cada docente puede crear sus datos"
on public.cdt_user_data for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Cada docente puede actualizar sus datos"
on public.cdt_user_data for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Cada docente puede borrar sus datos"
on public.cdt_user_data for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.cdt_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cdt_user_data_updated_at on public.cdt_user_data;
create trigger cdt_user_data_updated_at
before update on public.cdt_user_data
for each row execute function public.cdt_touch_updated_at();

-- Los documentos de licencias se migrarán a un bucket privado llamado
-- cdt-documentos. No crear políticas públicas: se usarán URLs firmadas.

create policy "CDT subir documentos propios"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'cdt-documentos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "CDT consultar documentos propios"
on storage.objects for select to authenticated
using (
  bucket_id = 'cdt-documentos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "CDT actualizar documentos propios"
on storage.objects for update to authenticated
using (
  bucket_id = 'cdt-documentos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'cdt-documentos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "CDT eliminar documentos propios"
on storage.objects for delete to authenticated
using (
  bucket_id = 'cdt-documentos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
