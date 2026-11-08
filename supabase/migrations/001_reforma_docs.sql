-- Tabela única da Reforma da Casa: cada linha é um andar, cômodo, serviço ou configuração.
create table if not exists public.reforma_docs (
  colecao text not null,          -- 'andares', 'comodos', 'itens' ou 'meta'
  id text not null,
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now(),
  primary key (colecao, id)
);

alter table public.reforma_docs enable row level security;

-- Acesso livre para quem tem o link do app (sem login).
drop policy if exists "acesso livre" on public.reforma_docs;
create policy "acesso livre" on public.reforma_docs
  for all to anon, authenticated
  using (true) with check (true);

-- Mudanças aparecem ao vivo em todos os aparelhos.
alter table public.reforma_docs replica identity full;
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reforma_docs'
  ) then
    alter publication supabase_realtime add table public.reforma_docs;
  end if;
end $$;
