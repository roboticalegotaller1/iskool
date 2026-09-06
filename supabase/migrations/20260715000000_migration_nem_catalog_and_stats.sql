-- 1. Crear tablas catálogo de la NEM (Nueva Escuela Mexicana)
create table if not exists public.nem_campos_formativos (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.nem_pdas (
  id uuid default uuid_generate_v4() primary key,
  campo_formativo_id uuid references public.nem_campos_formativos(id) on delete cascade not null,
  code text,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.nem_campos_formativos enable row level security;
alter table public.nem_pdas enable row level security;

-- Crear políticas de RLS para lectura pública/autenticada
drop policy if exists "Permitir lectura de campos formativos a usuarios autenticados" on public.nem_campos_formativos;
create policy "Permitir lectura de campos formativos a usuarios autenticados"
  on public.nem_campos_formativos for select
  to authenticated
  using (true);

drop policy if exists "Permitir lectura de pdas a usuarios autenticados" on public.nem_pdas;
create policy "Permitir lectura de pdas a usuarios autenticados"
  on public.nem_pdas for select
  to authenticated
  using (true);

-- Insertar datos iniciales para nem_campos_formativos
insert into public.nem_campos_formativos (name) values
  ('Lenguajes'),
  ('Saberes'),
  ('Ética'),
  ('De lo Humano')
on conflict (name) do nothing;

-- Insertar PDAs de prueba
insert into public.nem_pdas (campo_formativo_id, code, description)
values
  ((select id from public.nem_campos_formativos where name = 'Lenguajes' limit 1), 'PDA-LENG-01', 'Expresa oralmente ideas y emociones de manera lógica y coherente.'),
  ((select id from public.nem_campos_formativos where name = 'Lenguajes' limit 1), 'PDA-LENG-02', 'Lee y comprende diversos tipos de textos informativos y literarios.'),
  ((select id from public.nem_campos_formativos where name = 'Saberes' limit 1), 'PDA-SAB-01', 'Resuelve problemas que implican sumas, restas, multiplicaciones y divisiones.'),
  ((select id from public.nem_campos_formativos where name = 'Saberes' limit 1), 'PDA-SAB-02', 'Identifica y describe patrones de comportamiento en la naturaleza.'),
  ((select id from public.nem_campos_formativos where name = 'Ética' limit 1), 'PDA-ETI-01', 'Reconoce los derechos humanos y practica valores éticos fundamentales.'),
  ((select id from public.nem_campos_formativos where name = 'Ética' limit 1), 'PDA-ETI-02', 'Propone acciones para cuidar la biodiversidad y el medio ambiente local.'),
  ((select id from public.nem_campos_formativos where name = 'De lo Humano' limit 1), 'PDA-HUM-01', 'Reflexiona sobre sus propios sentimientos y empatiza con los de sus compañeros.'),
  ((select id from public.nem_campos_formativos where name = 'De lo Humano' limit 1), 'PDA-HUM-02', 'Participa activamente en dinámicas de colaboración grupal y autocuidado.')
on conflict do nothing;

-- 2. Actualizar las tablas quests y missions
alter table public.quests
  add column if not exists campo_formativo_id uuid references public.nem_campos_formativos(id) on delete set null,
  add column if not exists pda_ids uuid[];

alter table public.missions
  add column if not exists campo_formativo_id uuid references public.nem_campos_formativos(id) on delete set null,
  add column if not exists pda_ids uuid[];

-- 3. Actualizar la tabla student_stats con afinidad elemental
alter table public.student_stats
  add column if not exists stat_lenguajes integer default 0 not null check (stat_lenguajes >= 0),
  add column if not exists stat_saberes integer default 0 not null check (stat_saberes >= 0),
  add column if not exists stat_etica integer default 0 not null check (stat_etica >= 0),
  add column if not exists stat_de_lo_humano integer default 0 not null check (stat_de_lo_humano >= 0);

-- 4. Trigger y función para la regla de negocio de gamificación
create or replace function public.handle_quest_completion_stats()
returns trigger as $$
declare
  v_campo_formativo_name text;
  v_xp_earned integer;
  v_xp_reward integer;
begin
  -- Caso A: Quest completado por intento exitoso (Quizzes / Exams)
  if TG_TABLE_NAME = 'quest_attempts' then
    if NEW.is_completed = true and (OLD.is_completed is null or OLD.is_completed = false) then
      -- Obtener el campo formativo del Quest
      select q.xp_reward, cf.name
      into v_xp_reward, v_campo_formativo_name
      from public.quests q
      join public.nem_campos_formativos cf on q.campo_formativo_id = cf.id
      where q.id = NEW.quest_id;

      if found and v_campo_formativo_name is not null then
        -- XP ganado es proporcional a la puntuación obtenida
        v_xp_earned := round(v_xp_reward * (NEW.score / 100.0));
        
        -- Sumar XP a la afinidad elemental correspondiente
        if v_campo_formativo_name = 'Lenguajes' then
          update public.student_stats set stat_lenguajes = stat_lenguajes + v_xp_earned where student_id = NEW.student_id;
        elsif v_campo_formativo_name = 'Saberes' then
          update public.student_stats set stat_saberes = stat_saberes + v_xp_earned where student_id = NEW.student_id;
        elsif v_campo_formativo_name = 'Ética' then
          update public.student_stats set stat_etica = stat_etica + v_xp_earned where student_id = NEW.student_id;
        elsif v_campo_formativo_name = 'De lo Humano' then
          update public.student_stats set stat_de_lo_humano = stat_de_lo_humano + v_xp_earned where student_id = NEW.student_id;
        end if;
      end if;
    end if;
  
  -- Caso B: Quest completado por aprobación de portafolio
  elsif TG_TABLE_NAME = 'portfolio_items' then
    if NEW.status = 'approved' and OLD.status != 'approved' and NEW.quest_id is not null then
      -- Obtener el campo formativo del Quest
      select q.xp_reward, cf.name
      into v_xp_reward, v_campo_formativo_name
      from public.quests q
      join public.nem_campos_formativos cf on q.campo_formativo_id = cf.id
      where q.id = NEW.quest_id;

      if found and v_campo_formativo_name is not null then
        v_xp_reward := coalesce(v_xp_reward, 100); -- Fallback
        
        -- 1. Actualizar afinidad elemental
        if v_campo_formativo_name = 'Lenguajes' then
          update public.student_stats set stat_lenguajes = stat_lenguajes + v_xp_reward where student_id = NEW.student_id;
        elsif v_campo_formativo_name = 'Saberes' then
          update public.student_stats set stat_saberes = stat_saberes + v_xp_reward where student_id = NEW.student_id;
        elsif v_campo_formativo_name = 'Ética' then
          update public.student_stats set stat_etica = stat_etica + v_xp_reward where student_id = NEW.student_id;
        elsif v_campo_formativo_name = 'De lo Humano' then
          update public.student_stats set stat_de_lo_humano = stat_de_lo_humano + v_xp_reward where student_id = NEW.student_id;
        end if;

        -- 2. Asegurar que el XP/Monedas principales se apliquen en la base de datos para aprobación de portafolio
        perform public.process_reward(NEW.student_id, v_xp_reward, 20, 0, 0);
      end if;
    end if;
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Crear disparador para quest_attempts
drop trigger if exists tr_quest_attempts_completion on public.quest_attempts;
create trigger tr_quest_attempts_completion
  after insert or update of is_completed
  on public.quest_attempts
  for each row
  execute function public.handle_quest_completion_stats();

-- Crear disparador para portfolio_items
drop trigger if exists tr_portfolio_items_approval on public.portfolio_items;
create trigger tr_portfolio_items_approval
  after update of status
  on public.portfolio_items
  for each row
  execute function public.handle_quest_completion_stats();
