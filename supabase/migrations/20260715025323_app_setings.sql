-- ================================================================
-- euComprei · tabela de configurações globais (meta mensal)
-- Rode este SQL uma vez no Supabase (SQL Editor).
-- ================================================================

create table if not exists public.app_settings (
    id           text primary key default 'global',
    monthly_goal numeric(12, 2) not null default 0,
    updated_at   timestamptz not null default now(),
    updated_by   uuid references auth.users (id) on delete set null
);

-- Linha única inicial (meta global compartilhada).
insert into public.app_settings (id, monthly_goal)
values ('global', 0)
on conflict (id) do nothing;

-- O backend acessa via service role (bypassa RLS). Mantemos RLS
-- habilitado sem policies para bloquear acesso anônimo direto.
alter table public.app_settings enable row level security;
