-- Migration: 20260827000000_create_reading_metrics_and_rpc.sql
-- Description: Módulo avanzado de Comprensión Lectora y Pensamiento Lógico (reading_metrics y submit_reading_quest RPC)
-- Database: PostgreSQL (Supabase)

-- 1. Actualizar restricción de tipo en la tabla quests para admitir retos de lectura
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_name = 'quests' and constraint_name = 'quests_type_check'
  ) then
    alter table public.quests drop constraint quests_type_check;
    alter table public.quests add constraint quests_type_check check (type in ('quiz', 'portfolio_submission', 'reading', 'reading_comprehension'));
  end if;
end $$;

-- 2. Crear tabla reading_metrics
create table if not exists public.reading_metrics (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  quest_id uuid references public.quests(id) on delete set null,
  words_per_minute integer not null check (words_per_minute >= 0), -- PPM (Palabras por minuto)
  comprehension_score numeric(5,2) not null check (comprehension_score >= 0.00 and comprehension_score <= 100.00), -- Porcentaje de aciertos
  time_spent_seconds integer not null check (time_spent_seconds >= 0), -- Tiempo invertido en segundos
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar RLS
alter table public.reading_metrics enable row level security;

-- 4. Políticas RLS
drop policy if exists "Permitir lectura de métricas de lectura al propio alumno, docentes y directivos" on public.reading_metrics;
create policy "Permitir lectura de métricas de lectura al propio alumno, docentes y directivos"
  on public.reading_metrics for select
  to authenticated
  using (
    auth.uid() = student_id 
    or exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
        and profiles.role in ('teacher', 'coordinator', 'admin', 'director', 'superadmin', 'parent')
    )
  );

drop policy if exists "Permitir a estudiantes registrar sus propias métricas de lectura" on public.reading_metrics;
create policy "Permitir a estudiantes registrar sus propias métricas de lectura"
  on public.reading_metrics for insert
  to authenticated
  with check (auth.uid() = student_id);

drop policy if exists "Permitir a estudiantes actualizar sus propias métricas de lectura" on public.reading_metrics;
create policy "Permitir a estudiantes actualizar sus propias métricas de lectura"
  on public.reading_metrics for update
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- 5. Función RPC submit_reading_quest
create or replace function public.submit_reading_quest(
  p_student_id uuid,
  p_quest_id uuid default null,
  p_words_per_minute integer default 0,
  p_comprehension_score numeric default 0.0,
  p_time_spent_seconds integer default 0
)
returns jsonb
language plpgsql
security definer
SET search_path = public, pg_catalog, pg_temp
as $$
declare
  -- Recompensas base y cálculos
  v_base_xp integer := 80;
  v_base_coins integer := 20;
  v_speed_xp_bonus integer := 0;
  v_speed_coins_bonus integer := 0;
  v_comprehension_ratio numeric;
  v_xp_earned integer;
  v_coins_earned integer;
  
  -- Datos de student_stats
  v_current_xp integer;
  v_current_coins integer;
  v_level integer;
  v_skill_points integer;
  v_current_streak integer;
  v_max_streak integer;
  v_last_active date;
  v_today date := current_date;
  v_stat_lenguajes integer;
  
  -- Progresión
  v_xp_for_next_level integer;
  v_leveled_up boolean := false;
  v_feedback text;
  v_reading_metric_id uuid;
  v_attempt_id uuid := null;
  
  -- Insignias
  v_badge_earned_id uuid := null;
  v_badge_earned_name text := null;
  v_badge_earned_desc text := null;
  v_badge_earned_icon text := null;
begin
  -- 1. Verificación de Seguridad y Autenticación
  if auth.uid() is not null and auth.uid() != p_student_id then
    raise exception 'No autorizado: solo el propio alumno puede registrar sus métricas de lectura';
  end if;

  -- 2. Validación de Parámetros de Entrada
  if p_words_per_minute < 0 or p_words_per_minute > 2000 then
    raise exception 'El valor de Palabras por Minuto (PPM) es inválido (debe estar entre 0 y 2000)';
  end if;

  if p_comprehension_score < 0.0 or p_comprehension_score > 100.0 then
    raise exception 'El porcentaje de comprensión debe ubicarse entre 0.00 y 100.00';
  end if;

  if p_time_spent_seconds < 0 then
    raise exception 'El tiempo invertido no puede ser un valor negativo';
  end if;

  -- 3. Obtener configuración del Quest si fue proporcionado
  if p_quest_id is not null then
    select coalesce(xp_reward, 80), coalesce(coins_reward, 20)
    into v_base_xp, v_base_coins
    from public.quests
    where id = p_quest_id;
  end if;

  -- 4. Obtener estadísticas actuales del estudiante
  select xp, level, coins, current_streak, max_streak, last_active_date, skill_points, stat_lenguajes
  into v_current_xp, v_level, v_current_coins, v_current_streak, v_max_streak, v_last_active, v_skill_points, v_stat_lenguajes
  from public.student_stats
  where student_id = p_student_id;

  if not found then
    raise exception 'Estadísticas del alumno (%) no encontradas en student_stats', p_student_id;
  end if;

  -- 5. Algoritmo Pedagógico de Cálculo de Recompensas (PPM + Comprensión)
  -- A. Bono de Velocidad y Fluidez Lectora (PPM)
  if p_words_per_minute >= 280 then
    v_speed_xp_bonus := 50;
    v_speed_coins_bonus := 20;
  elsif p_words_per_minute >= 200 then
    v_speed_xp_bonus := 35;
    v_speed_coins_bonus := 15;
  elsif p_words_per_minute >= 140 then
    v_speed_xp_bonus := 20;
    v_speed_coins_bonus := 10;
  elsif p_words_per_minute >= 90 then
    v_speed_xp_bonus := 10;
    v_speed_coins_bonus := 5;
  else
    v_speed_xp_bonus := 0;
    v_speed_coins_bonus := 0;
  end if;

  -- Condicionar el bono de velocidad a que exista un mínimo de comprensión lectora (>= 60%)
  if p_comprehension_score < 60.0 then
    v_speed_xp_bonus := round(v_speed_xp_bonus * 0.25);
    v_speed_coins_bonus := round(v_speed_coins_bonus * 0.25);
  end if;

  -- B. Ponderación por Comprensión
  v_comprehension_ratio := p_comprehension_score / 100.0;
  v_xp_earned := round((v_base_xp * v_comprehension_ratio) + v_speed_xp_bonus);
  v_coins_earned := round((v_base_coins * v_comprehension_ratio) + v_speed_coins_bonus);

  -- Bono adicional por comprensión perfecta (100%)
  if p_comprehension_score = 100.0 then
    v_coins_earned := v_coins_earned + 10; -- Bono de Galeón por maestría absoluta
    v_xp_earned := v_xp_earned + 20;
  end if;

  -- Garantizar un piso mínimo motivacional si completó la lectura
  if v_xp_earned < 10 and p_time_spent_seconds >= 15 then
    v_xp_earned := 10;
  end if;
  if v_coins_earned < 2 and p_time_spent_seconds >= 15 then
    v_coins_earned := 2;
  end if;

  -- 6. Actualización de Racha Diaria (Streak)
  if v_last_active is null then
    v_current_streak := 1;
  elsif v_last_active = v_today then
    -- Actividad ya registrada hoy, se mantiene la racha
  elsif v_last_active = v_today - 1 then
    v_current_streak := v_current_streak + 1;
  else
    v_current_streak := 1; -- Racha reiniciada
  end if;

  if v_current_streak > v_max_streak then
    v_max_streak := v_current_streak;
  end if;

  -- 7. Progresión de XP, Monedas de Galeón y Ascenso de Nivel
  v_current_xp := v_current_xp + v_xp_earned;
  v_current_coins := v_current_coins + v_coins_earned;
  v_stat_lenguajes := coalesce(v_stat_lenguajes, 0) + v_xp_earned;

  v_xp_for_next_level := v_level * 200;
  while v_current_xp >= v_xp_for_next_level loop
    v_current_xp := v_current_xp - v_xp_for_next_level;
    v_level := v_level + 1;
    v_skill_points := coalesce(v_skill_points, 0) + 2;
    v_leveled_up := true;
    v_xp_for_next_level := v_level * 200;
  end loop;

  -- 8. Mensaje de Feedback Pedagógico Personalizado
  if p_comprehension_score = 100.0 and p_words_per_minute >= 180 then
    v_feedback := '¡Maestría Lectora Sobresaliente! Velocidad de ' || p_words_per_minute || ' PPM con 100% de comprensión. ¡Has ganado el bono de Galeón!';
  elsif p_comprehension_score >= 80.0 then
    v_feedback := '¡Excelente comprensión lectora (' || p_comprehension_score || '%) a ' || p_words_per_minute || ' PPM! Tu pensamiento analítico sigue evolucionando.';
  elsif p_comprehension_score >= 60.0 then
    v_feedback := '¡Buen trabajo! Has comprendido las ideas centrales (' || p_comprehension_score || '%). Continúa practicando tu velocidad y retención.';
  else
    v_feedback := 'Lectura registrada. Recuerda que la concentración es clave: lee a un ritmo cómodo para maximizar tu comprensión en el próximo reto.';
  end if;

  -- 9. Guardar Métrica en reading_metrics
  insert into public.reading_metrics (
    student_id,
    quest_id,
    words_per_minute,
    comprehension_score,
    time_spent_seconds,
    created_at
  )
  values (
    p_student_id,
    p_quest_id,
    p_words_per_minute,
    p_comprehension_score,
    p_time_spent_seconds,
    now()
  )
  returning id into v_reading_metric_id;

  -- 10. Registrar Intento en quest_attempts si existe quest_id
  if p_quest_id is not null then
    insert into public.quest_attempts (
      student_id,
      quest_id,
      score,
      is_completed,
      answers,
      feedback,
      created_at
    )
    values (
      p_student_id,
      p_quest_id,
      p_comprehension_score,
      (p_comprehension_score >= 60.0),
      jsonb_build_object(
        'words_per_minute', p_words_per_minute,
        'comprehension_score', p_comprehension_score,
        'time_spent_seconds', p_time_spent_seconds,
        'module', 'reading_comprehension'
      ),
      v_feedback,
      now()
    )
    returning id into v_attempt_id;
  end if;

  -- 11. Actualizar Estadísticas en student_stats
  update public.student_stats
  set xp = v_current_xp,
      level = v_level,
      coins = v_current_coins,
      current_streak = v_current_streak,
      max_streak = v_max_streak,
      last_active_date = v_today,
      skill_points = v_skill_points,
      stat_lenguajes = v_stat_lenguajes,
      updated_at = now()
  where student_id = p_student_id;

  -- 12. Desbloqueo de Insignias Temáticas (Lector de las Galaxias)
  if p_comprehension_score >= 90.0 and p_words_per_minute >= 150 then
    select id, name, description, icon_name
    into v_badge_earned_id, v_badge_earned_name, v_badge_earned_desc, v_badge_earned_icon
    from public.badges
    where name ilike '%lector%'
    limit 1;

    if v_badge_earned_id is not null and not exists (
      select 1 from public.student_badges where student_id = p_student_id and badge_id = v_badge_earned_id
    ) then
      insert into public.student_badges (student_id, badge_id, earned_at)
      values (p_student_id, v_badge_earned_id, now());
    else
      v_badge_earned_id := null;
    end if;
  end if;

  -- 13. Retornar Respuesta Estructurada
  return jsonb_build_object(
    'success', true,
    'reading_metric_id', v_reading_metric_id,
    'attempt_id', v_attempt_id,
    'xp_earned', v_xp_earned,
    'coins_earned', v_coins_earned,
    'words_per_minute', p_words_per_minute,
    'comprehension_score', p_comprehension_score,
    'time_spent_seconds', p_time_spent_seconds,
    'leveled_up', v_leveled_up,
    'feedback', v_feedback,
    'new_stats', jsonb_build_object(
      'xp', v_current_xp,
      'level', v_level,
      'coins', v_current_coins,
      'current_streak', v_current_streak,
      'max_streak', v_max_streak,
      'skill_points', v_skill_points,
      'stat_lenguajes', v_stat_lenguajes
    ),
    'badge_earned', case
      when v_badge_earned_id is not null then jsonb_build_object(
        'id', v_badge_earned_id,
        'name', v_badge_earned_name,
        'description', v_badge_earned_desc,
        'icon_name', v_badge_earned_icon
      )
      else null
    end
  );
end;
$$;
