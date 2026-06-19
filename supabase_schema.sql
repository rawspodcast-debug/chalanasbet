-- Cole isto no Supabase: SQL Editor -> New query -> Run

create table if not exists kv (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

alter table kv enable row level security;

-- Bolão entre amigos: acesso público de leitura e escrita pela chave anon.
-- (Dados são apenas palpites/placares; sem informação sensível.)
drop policy if exists "kv_select" on kv;
drop policy if exists "kv_insert" on kv;
drop policy if exists "kv_update" on kv;
drop policy if exists "kv_delete" on kv;

create policy "kv_select" on kv for select using (true);
create policy "kv_insert" on kv for insert with check (true);
create policy "kv_update" on kv for update using (true) with check (true);
create policy "kv_delete" on kv for delete using (true);
