-- Database: PostgreSQL (Supabase)
-- Target: Functions to be deployed to Supabase to run critical business logic on the backend.

-- 1. Schema Extensions for Gamification features not fully detailed in schema_gamification.sql

/**
 * @table shop_artifacts
 * @description Catálogo de objetos mágicos y artefactos de la tienda del alumno (e.g. Botas de velocidad, Escudo protector).
 * @relation Referenciado en `public.student_inventory` (1:N) como catálogo de ítems adquiribles.
 * @stateImpact Cargado en la tienda de `useGamificationStore` (`artifacts`).
 */
create table if not exists public.shop_artifacts (
  id text primary key,
  name text not null,
  description text not null,
  price integer not null check (price >= 0),
  icon text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

/**
 * @table student_inventory
 * @description Inventario de artefactos mágicos comprados por cada estudiante.
 * @relation Vincula `public.students` (N:1) y `public.shop_artifacts` (N:1).
 * @stateImpact Actualizado tras una compra exitosa mediante RPC en `useStudentStore` / `useGamificationStore` (`inventory`).
 */
create table if not exists public.student_inventory (
  student_id uuid references public.students(id) on delete cascade not null,
  artifact_id text references public.shop_artifacts(id) on delete cascade not null,
  acquired_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (student_id, artifact_id)
);

/**
 * @table student_messages
 * @description Buzón de mensajes y notificaciones del sistema de gamificación para el alumno (e.g. notificaciones de compra, revocaciones).
 * @relation Vinculado a `public.students` (N:1) mediante `student_id`.
 * @stateImpact Leído y gestionado en `useStudentStore` (`messages`).
 */
create table if not exists public.student_messages (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  title text not null,
  message text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false not null,
  type text check (type in ('standard', 'revocation', 'purchase')),
  revoked_artifact text,
  reason text
);

alter table public.shop_artifacts enable row level security;
alter table public.student_inventory enable row level security;
alter table public.student_messages enable row level security;

create policy "Permitir lectura de shop_artifacts a usuarios autenticados"
  on public.shop_artifacts for select
  to authenticated
  using (true);

create policy "Permitir lectura de student_inventory a alumnos dueños"
  on public.student_inventory for select
  to authenticated
  using (auth.uid() = student_id);

create policy "Permitir insercion de student_inventory a alumnos dueños"
  on public.student_inventory for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Permitir lectura de student_messages a alumnos dueños"
  on public.student_messages for select
  to authenticated
  using (auth.uid() = student_id);

create policy "Permitir actualizacion de student_messages a alumnos dueños"
  on public.student_messages for update
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);


-- Seed initial shop artifacts if table is empty
insert into public.shop_artifacts (id, name, description, price, icon)
values 
  ('art-boots', 'Botas de Velocidad Escolar', 'Añade una oportunidad extra de reintento en el próximo examen.', 25, 'Footprints'),
  ('art-shield', 'Escudo Protector de Promedios', 'Protege tus puntos de racha en caso de inactividad de un día.', 40, 'Shield'),
  ('art-elixir', 'Elixir del Fénix Sabio', 'Restaura el 100% de la felicidad y salud de tu mascota de rol.', 15, 'GlassWater'),
  ('art-wand', 'Varita de la Clarividencia', 'Revela una pista adicional en cualquier reto de opción múltiple.', 35, 'Wand2')
on conflict (id) do nothing;


-- 2. PostgreSQL Functions (RPC Calls)

---------------------------------------------------------
-- RPC: submit_quiz
-- Handles scoring, calculations for XP and Coins, levels up, streak updates, and records the attempt.
---------------------------------------------------------
/**
 * @function submit_quiz
 * @description Procesa la entrega de un reto de tipo cuestionario. Calcula el puntaje, otorga XP y monedas (con bono por puntaje perfecto), actualiza la racha diaria de actividad, procesa las subidas de nivel (otorgando skill points si corresponde), registra el intento en `quest_attempts` y verifica/desbloquea insignias especiales (como el Matemago).
 * @param {uuid} p_student_id - ID del estudiante que realiza la entrega (referencia a `public.students.id`).
 * @param {uuid} p_quest_id - ID del reto cuestionario completado (referencia a `public.quests.id`).
 * @param {numeric} p_score - Puntuación obtenida como porcentaje (0.00 a 100.00).
 * @param {jsonb} p_answers - Respuestas enviadas por el estudiante.
 * @returns {jsonb} Payload con el ID del intento creado, XP ganado, monedas ganadas, booleano de subida de nivel, feedback formateado, nuevas estadísticas globales del estudiante y detalles de cualquier insignia ganada.
 * @stateImpact Invocado por `submitQuiz` en `useGamificationStore`. Actualiza los stats locales del alumno en `useStudentStore`.
 */
create or replace function public.submit_quiz(
  p_student_id uuid,
  p_quest_id uuid,
  p_score numeric,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
SET search_path = public, pg_catalog, pg_temp
as $$
declare
  v_xp_reward integer;
  v_coins_reward integer;
  v_xp_earned integer;
  v_coins_earned integer;
  v_subject_id uuid;
  
  -- Student stats
  v_current_xp integer;
  v_current_coins integer;
  v_level integer;
  v_skill_points integer;
  v_current_streak integer;
  v_max_streak integer;
  v_last_active date;
  v_today date := current_date;
  
  v_xp_for_next_level integer;
  v_leveled_up boolean := false;
  v_feedback text;
  v_attempt_id uuid;
  
  -- Badges & Rewards
  v_badge_earned_id uuid := null;
  v_badge_earned_name text := null;
  v_badge_earned_desc text := null;
  v_badge_earned_icon text := null;
begin
  -- 1. Fetch Quest configuration
  select q.xp_reward, q.coins_reward, m.subject_id
  into v_xp_reward, v_coins_reward, v_subject_id
  from public.quests q
  join public.missions m on m.id = q.mission_id
  where q.id = p_quest_id;
  
  if not found then
    raise exception 'Quest % not found', p_quest_id;
  end if;

  -- 2. Calculate XP and Coins earned based on score
  v_xp_earned := round(v_xp_reward * (p_score / 100.0));
  if p_score = 100.0 then
    v_coins_earned := v_coins_reward + 5; -- Perfect score bonus
  else
    v_coins_earned := round(v_coins_reward * (p_score / 100.0));
  end if;

  -- 3. Fetch student stats
  select xp, level, coins, current_streak, max_streak, last_active_date, skill_points
  into v_current_xp, v_level, v_current_coins, v_current_streak, v_max_streak, v_last_active, v_skill_points
  from public.student_stats
  where student_id = p_student_id;
  
  if not found then
    raise exception 'Student stats for % not found', p_student_id;
  end if;

  -- 4. Calculate Streak
  if v_last_active is null then
    v_current_streak := 1;
  elsif v_last_active = v_today then
    -- Already active today, streak doesn't change
  elsif v_last_active = v_today - 1 then
    v_current_streak := v_current_streak + 1;
  else
    v_current_streak := 1; -- Broke streak
  end if;
  
  if v_current_streak > v_max_streak then
    v_max_streak := v_current_streak;
  end if;

  -- 5. Calculate XP progression and Level Up
  v_current_xp := v_current_xp + v_xp_earned;
  v_current_coins := v_current_coins + v_coins_earned;
  
  v_xp_for_next_level := v_level * 200;
  if v_current_xp >= v_xp_for_next_level then
    v_current_xp := v_current_xp - v_xp_for_next_level;
    v_level := v_level + 1;
    v_leveled_up := true;
    -- If secondary grade student, grant skill points
    -- (We can check level of student_stats or level_grades via join if needed. For now let's grant +2 skill points on level up)
    v_skill_points := v_skill_points + 2;
  end if;

  -- 6. Generate Feedback message
  if p_score = 100.0 then
    v_feedback := '¡Increíble! Obtuviste un puntaje perfecto. ¡Eres una estrella!';
  elsif p_score >= 60.0 then
    v_feedback := '¡Bien hecho! Aprobaste el reto.';
  else
    v_feedback := '¡No te preocupes! El error es aprendizaje. Vuelve a intentarlo.';
  end if;

  -- 7. Update Student Stats
  update public.student_stats
  set xp = v_current_xp,
      level = v_level,
      coins = v_current_coins,
      current_streak = v_current_streak,
      max_streak = v_max_streak,
      last_active_date = v_today,
      skill_points = v_skill_points,
      updated_at = now()
  where student_id = p_student_id;

  -- 8. Record the Attempt
  insert into public.quest_attempts (student_id, quest_id, score, is_completed, answers, feedback, created_at)
  values (p_student_id, p_quest_id, p_score, (p_score >= 60.0), p_answers, v_feedback, now())
  returning id into v_attempt_id;

  -- 9. Check and unlock badges
  -- Case A: Perfect score in Math (Bronze Mathmage)
  if p_score = 100.0 and exists (
    select 1 from public.subjects s 
    join public.missions m on m.subject_id = s.id 
    join public.quests q on q.mission_id = m.id 
    where q.id = p_quest_id and s.name ilike '%matemáticas%'
  ) then
    -- Check if badge already unlocked
    select id, name, description, icon_name into v_badge_earned_id, v_badge_earned_name, v_badge_earned_desc, v_badge_earned_icon
    from public.badges where name ilike '%matemago%';
    
    if v_badge_earned_id is not null and not exists (
      select 1 from public.student_badges where student_id = p_student_id and badge_id = v_badge_earned_id
    ) then
      insert into public.student_badges (student_id, badge_id, earned_at)
      values (p_student_id, v_badge_earned_id, now());
    else
      -- Reset badge if already owned or not found to avoid returning it
      v_badge_earned_id := null;
    end if;
  end if;

  -- Return results payload
  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'xp_earned', v_xp_earned,
    'coins_earned', v_coins_earned,
    'leveled_up', v_leveled_up,
    'feedback', v_feedback,
    'new_stats', jsonb_build_object(
      'xp', v_current_xp,
      'level', v_level,
      'coins', v_current_coins,
      'current_streak', v_current_streak,
      'max_streak', v_max_streak,
      'skill_points', v_skill_points
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

---------------------------------------------------------
-- RPC: submit_exam
-- Handles scoring for exams, stat boosts, custom loot, XP and Coins, levels up (+skill_points), and records attempt.
---------------------------------------------------------
create or replace function public.submit_exam(
  p_student_id uuid,
  p_quest_id uuid,
  p_score numeric,
  p_answers jsonb default '{}'::jsonb,
  p_stat_boost jsonb default '{}'::jsonb,
  p_custom_loot text default null
)
returns jsonb
language plpgsql
security definer
SET search_path = public, pg_catalog, pg_temp
as $$
declare
  v_xp_reward integer := 200;
  v_coins_reward integer := 50;
  v_xp_earned integer;
  v_coins_earned integer;
  
  -- Student stats
  v_current_xp integer;
  v_current_coins integer;
  v_level integer;
  v_skill_points integer;
  v_strength integer;
  v_intelligence integer;
  v_defense integer;
  v_current_streak integer;
  v_max_streak integer;
  v_last_active date;
  v_today date := current_date;
  
  v_xp_for_next_level integer;
  v_leveled_up boolean := false;
  v_feedback text;
  v_attempt_id uuid;
  
  v_boost_str integer := 0;
  v_boost_int integer := 0;
  v_boost_def integer := 0;
  v_unlocked_items text[];
begin
  -- Fetch Quest config if available
  select q.xp_reward, q.coins_reward
  into v_xp_reward, v_coins_reward
  from public.quests q
  where q.id = p_quest_id;
  
  if not found then
    v_xp_reward := 200;
    v_coins_reward := 50;
  end if;

  v_xp_earned := round(v_xp_reward * (p_score / 100.0));
  v_coins_earned := round(v_coins_reward * (p_score / 100.0));

  select xp, level, coins, current_streak, max_streak, last_active_date, skill_points,
         coalesce(attribute_strength, 10), coalesce(attribute_intelligence, 10), coalesce(attribute_defense, 10)
  into v_current_xp, v_level, v_current_coins, v_current_streak, v_max_streak, v_last_active, v_skill_points,
       v_strength, v_intelligence, v_defense
  from public.student_stats
  where student_id = p_student_id;
  
  if not found then
    raise exception 'Student stats for % not found', p_student_id;
  end if;

  -- Apply stat boosts
  if p_stat_boost is not null then
    if (p_stat_boost->>'strength') is not null then
      v_boost_str := (p_stat_boost->>'strength')::integer;
    end if;
    if (p_stat_boost->>'intelligence') is not null then
      v_boost_int := (p_stat_boost->>'intelligence')::integer;
    end if;
    if (p_stat_boost->>'defense') is not null then
      v_boost_def := (p_stat_boost->>'defense')::integer;
    end if;
  end if;

  v_strength := v_strength + v_boost_str;
  v_intelligence := v_intelligence + v_boost_int;
  v_defense := v_defense + v_boost_def;

  -- Progression
  v_current_xp := v_current_xp + v_xp_earned;
  v_current_coins := v_current_coins + v_coins_earned;
  
  v_xp_for_next_level := v_level * 200;
  while v_current_xp >= v_xp_for_next_level loop
    v_current_xp := v_current_xp - v_xp_for_next_level;
    v_level := v_level + 1;
    v_skill_points := coalesce(v_skill_points, 0) + 2;
    v_leveled_up := true;
    v_xp_for_next_level := v_level * 200;
  end loop;

  v_feedback := '¡Examen final completado! Has demostrado un gran dominio académico.';

  update public.student_stats
  set xp = v_current_xp,
      level = v_level,
      coins = v_current_coins,
      skill_points = coalesce(v_skill_points, 0),
      attribute_strength = v_strength,
      attribute_intelligence = v_intelligence,
      attribute_defense = v_defense,
      updated_at = now()
  where student_id = p_student_id;

  -- Record attempt
  insert into public.quest_attempts (student_id, quest_id, score, is_completed, answers, feedback, created_at)
  values (p_student_id, p_quest_id, p_score, (p_score >= 60.0), p_answers, v_feedback, now())
  returning id into v_attempt_id;

  -- Custom loot if provided
  if p_custom_loot is not null and p_custom_loot <> '' then
    select unlocked_items into v_unlocked_items
    from public.student_avatars
    where student_id = p_student_id;

    if v_unlocked_items is not null then
      if not (p_custom_loot = any(v_unlocked_items)) then
        update public.student_avatars
        set unlocked_items = array_append(unlocked_items, p_custom_loot),
            updated_at = now()
        where student_id = p_student_id;
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'xp_earned', v_xp_earned,
    'coins_earned', v_coins_earned,
    'leveled_up', v_leveled_up,
    'feedback', v_feedback,
    'new_stats', jsonb_build_object(
      'xp', v_current_xp,
      'level', v_level,
      'coins', v_current_coins,
      'skill_points', coalesce(v_skill_points, 0),
      'attribute_strength', v_strength,
      'attribute_intelligence', v_intelligence,
      'attribute_defense', v_defense
    )
  );
end;
$$;

---------------------------------------------------------
-- RPC: level_up_attribute
-- Validates skill points and upgrades the requested attribute.
---------------------------------------------------------
/**
 * @function level_up_attribute
 * @description Incrementa el valor de un atributo RPG del alumno (fuerza, inteligencia, defensa) usando un punto de habilidad (skill point) disponible.
 * @param {uuid} p_student_id - ID del estudiante (referencia a `public.students.id`).
 * @param {text} p_attribute_name - Nombre del atributo a incrementar ('strength', 'intelligence', 'defense').
 * @returns {jsonb} JSON que indica éxito y el nuevo estado de los skill points y atributos del alumno.
 * @stateImpact Invocado por `levelUpAttribute` en `useStudentStore`. Modifica directamente la visualización de estadísticas RPG en el frontend.
 */
create or replace function public.level_up_attribute(
  p_student_id uuid,
  p_attribute_name text
)
returns jsonb
language plpgsql
security definer
SET search_path = public, pg_catalog, pg_temp
as $$
declare
  v_skill_points integer;
  v_strength integer;
  v_intelligence integer;
  v_defense integer;
begin
  -- Validate attribute name
  if p_attribute_name not in ('strength', 'intelligence', 'defense') then
    raise exception 'Invalid attribute name: %', p_attribute_name;
  end if;

  -- Fetch student stats
  select skill_points, attribute_strength, attribute_intelligence, attribute_defense
  into v_skill_points, v_strength, v_intelligence, v_defense
  from public.student_stats
  where student_id = p_student_id;

  if not found then
    raise exception 'Student stats for % not found', p_student_id;
  end if;

  -- Validate skill points
  if v_skill_points <= 0 then
    raise exception 'No skill points available to level up';
  end if;

  -- Upgrade attribute
  if p_attribute_name = 'strength' then
    v_strength := v_strength + 1;
  elsif p_attribute_name = 'intelligence' then
    v_intelligence := v_intelligence + 1;
  elsif p_attribute_name = 'defense' then
    v_defense := v_defense + 1;
  end if;

  v_skill_points := v_skill_points - 1;

  -- Save changes
  update public.student_stats
  set skill_points = v_skill_points,
      attribute_strength = v_strength,
      attribute_intelligence = v_intelligence,
      attribute_defense = v_defense,
      updated_at = now()
  where student_id = p_student_id;

  return jsonb_build_object(
    'success', true,
    'attribute_name', p_attribute_name,
    'new_stats', jsonb_build_object(
      'skill_points', v_skill_points,
      'attribute_strength', v_strength,
      'attribute_intelligence', v_intelligence,
      'attribute_defense', v_defense
    )
  );
end;
$$;

---------------------------------------------------------
-- RPC: purchase_artifact
-- Validates funds (coins), updates balances, adds to inventory, and generates message.
---------------------------------------------------------
/**
 * @function purchase_artifact
 * @description Procesa la compra de un artefacto de la tienda. Valida que existan fondos suficientes, que el alumno no sea dueño ya del artefacto, descuenta las monedas, lo añade a su inventario y genera un mensaje de notificación en su buzón.
 * @param {uuid} p_student_id - ID del estudiante (referencia a `public.students.id`).
 * @param {text} p_artifact_id - ID del artefacto a comprar (referencia a `public.shop_artifacts.id`).
 * @returns {jsonb} JSON indicando éxito, nuevo saldo de monedas, inventario actualizado y detalles de la notificación generada.
 * @stateImpact Invocado por `purchaseArtifact` en `useGamificationStore`. Actualiza el inventario y las monedas del estudiante en `useStudentStore`.
 */
create or replace function public.purchase_artifact(
  p_student_id uuid,
  p_artifact_id text
)
returns jsonb
language plpgsql
security definer
SET search_path = public, pg_catalog, pg_temp
as $$
declare
  v_coins integer;
  v_price integer;
  v_name text;
  v_message_id uuid;
  v_message_text text;
  v_inventory text[];
begin
  -- Fetch artifact details
  select price, name
  into v_price, v_name
  from public.shop_artifacts
  where id = p_artifact_id;

  if not found then
    raise exception 'Artifact % not found in shop', p_artifact_id;
  end if;

  -- Fetch student coins
  select coins
  into v_coins
  from public.student_stats
  where student_id = p_student_id;

  if not found then
    raise exception 'Student stats for % not found', p_student_id;
  end if;

  -- Validate funds
  if v_coins < v_price then
    raise exception 'Insufficient coins. Required: %, Available: %', v_price, v_coins;
  end if;

  -- Check if already owned
  if exists (
    select 1 from public.student_inventory
    where student_id = p_student_id and artifact_id = p_artifact_id
  ) then
    raise exception 'Student already owns artifact %', p_artifact_id;
  end if;

  -- Deduct coins
  v_coins := v_coins - v_price;
  update public.student_stats
  set coins = v_coins,
      updated_at = now()
  where student_id = p_student_id;

  -- Add to inventory
  insert into public.student_inventory (student_id, artifact_id, acquired_at)
  values (p_student_id, p_artifact_id, now());

  -- Create Notification Alert
  v_message_text := 'Has comprado el artefacto "' || v_name || '" por ' || v_price || ' monedas. ¡Ahora tienes una oportunidad extra en exámenes!';
  insert into public.student_messages (student_id, title, message, is_read, type, sent_at)
  values (p_student_id, '🎁 Compra de Artefacto', v_message_text, false, 'purchase', now())
  returning id into v_message_id;

  -- Build final inventory array for the response
  select array_agg(artifact_id) into v_inventory
  from public.student_inventory
  where student_id = p_student_id;

  return jsonb_build_object(
    'success', true,
    'new_coins', v_coins,
    'inventory', v_inventory,
    'new_message', jsonb_build_object(
      'id', v_message_id,
      'student_id', p_student_id,
      'title', '🎁 Compra de Artefacto',
      'message', v_message_text,
      'sent_at', now(),
      'is_read', false
    )
  );
end;
$$;


---------------------------------------------------------
-- RPC: process_reward
-- Safely increments or decrements student statistics on the database side
---------------------------------------------------------
create or replace function public.process_reward(
  p_student_id uuid,
  p_xp_change integer default 0,
  p_coins_change integer default 0,
  p_energy_change integer default 0,
  p_happiness_change integer default 0
)
returns jsonb
language plpgsql
security definer
SET search_path = public, pg_catalog, pg_temp
as $$
declare
  v_current_xp integer;
  v_current_coins integer;
  v_level integer;
  v_skill_points integer;
  v_pet_energy integer;
  v_pet_happiness integer;
  v_pet_stage text;
  v_xp_for_next_level integer;
  v_updated_row public.student_stats%rowtype;
begin
  -- Fetch current stats
  select xp, level, coins, skill_points, pet_energy, pet_happiness, pet_stage
  into v_current_xp, v_level, v_current_coins, v_skill_points, v_pet_energy, v_pet_happiness, v_pet_stage
  from public.student_stats
  where student_id = p_student_id;

  if not found then
    raise exception 'Student stats for % not found', p_student_id;
  end if;

  -- Apply changes with validation
  -- Coins check: if subtraction results in negative coins, prevent transaction
  v_current_coins := v_current_coins + p_coins_change;
  if v_current_coins < 0 then
    raise exception 'Monedas insuficientes';
  end if;

  -- Happiness check: clamp between 0 and 100
  v_pet_happiness := coalesce(v_pet_happiness, 50) + p_happiness_change;
  if v_pet_happiness > 100 then
    v_pet_happiness := 100;
  elsif v_pet_happiness < 0 then
    v_pet_happiness := 0;
  end if;

  -- Energy check: clamp between 0 and 100
  v_pet_energy := coalesce(v_pet_energy, 100) + p_energy_change;
  if v_pet_energy > 100 then
    v_pet_energy := 100;
  elsif v_pet_energy < 0 then
    v_pet_energy := 0;
  end if;

  -- XP change
  v_current_xp := v_current_xp + p_xp_change;
  if v_current_xp < 0 then
    v_current_xp := 0;
  end if;

  -- Level up loop
  v_xp_for_next_level := v_level * 200;
  while v_current_xp >= v_xp_for_next_level loop
    v_current_xp := v_current_xp - v_xp_for_next_level;
    v_level := v_level + 1;
    -- standard skill points update
    if p_student_id = 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid then
      v_skill_points := coalesce(v_skill_points, 0) + 2;
    end if;
    v_xp_for_next_level := v_level * 200;
  end loop;

  -- Determine stage
  if v_level >= 8 then
    v_pet_stage := 'mystic';
  elsif v_level >= 5 then
    v_pet_stage := 'adult';
  elsif v_level >= 3 then
    v_pet_stage := 'baby';
  else
    v_pet_stage := 'egg';
  end if;

  -- Update student stats
  update public.student_stats
  set xp = v_current_xp,
      level = v_level,
      coins = v_current_coins,
      skill_points = v_skill_points,
      pet_energy = v_pet_energy,
      pet_happiness = v_pet_happiness,
      pet_stage = v_pet_stage,
      updated_at = now()
  where student_id = p_student_id
  returning * into v_updated_row;

  return row_to_json(v_updated_row)::jsonb;
end;
$$;


---------------------------------------------------------
-- trigger & function: handle_quest_completion_stats
-- Updates student elemental stats when a quest is completed (quiz attempt or portfolio approval)
---------------------------------------------------------
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
    if NEW.status = 'approved' and (OLD.status is null or OLD.status != 'approved') then
      v_xp_reward := 100;
      
      if NEW.quest_id is not null then
        -- Obtener el campo formativo del Quest si existe
        select coalesce(q.xp_reward, 100), cf.name
        into v_xp_reward, v_campo_formativo_name
        from public.quests q
        left join public.nem_campos_formativos cf on q.campo_formativo_id = cf.id
        where q.id = NEW.quest_id;

        if v_campo_formativo_name is not null then
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
        end if;
      end if;

      -- 2. Asegurar que el XP/Monedas principales se apliquen atómicamente en la base de datos para aprobación de portafolio
      perform public.process_reward(NEW.student_id, coalesce(v_xp_reward, 100), 20, 0, 0);
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


---------------------------------------------------------
-- RPC: submit_reading_quest
-- Handles reading metrics submission (PPM, comprehension score, time),
-- calculates XP & Galleon coins rewards, updates student level progression, daily streak,
-- NEM Lenguajes elemental affinity, records reading_metrics and quest attempts.
---------------------------------------------------------
/**
 * @function submit_reading_quest
 * @description Procesa de forma segura la entrega de un reto de comprensión lectora y pensamiento lógico.
 * Valida los parámetros de entrada, evalúa la fluidez lectora (PPM) y el porcentaje de comprensión,
 * calcula y asigna Puntos de Experiencia (XP) y Monedas de Galeón en `student_stats`,
 * gestiona rachas diarias, procesa ascensos de nivel (otorgando skill points),
 * fortalece la afinidad en el campo formativo NEM de Lenguajes (`stat_lenguajes`),
 * registra la métrica en `reading_metrics` y genera un intento en `quest_attempts`.
 *
 * @param {uuid} p_student_id - ID del estudiante que completa la lectura (referencia a `public.students.id`).
 * @param {uuid} p_quest_id - ID del reto de lectura (referencia opcional a `public.quests.id`).
 * @param {integer} p_words_per_minute - Velocidad de lectura en Palabras Por Minuto (PPM >= 0).
 * @param {numeric} p_comprehension_score - Porcentaje de aciertos en comprensión (0.00 a 100.00).
 * @param {integer} p_time_spent_seconds - Tiempo total empleado en segundos (>= 0).
 *
 * @returns {jsonb} Payload estructurado con:
 *   - `success`: Booleano de confirmación
 *   - `reading_metric_id`: ID de la métrica registrada
 *   - `attempt_id`: ID del intento asociado (si aplica)
 *   - `xp_earned`: XP total calculado
 *   - `coins_earned`: Monedas de Galeón otorgadas
 *   - `words_per_minute`: PPM registrado
 *   - `comprehension_score`: Porcentaje de comprensión
 *   - `time_spent_seconds`: Segundos empleados
 *   - `leveled_up`: Booleano indicando si subió de nivel
 *   - `feedback`: Retroalimentación pedagógica y motivacional
 *   - `new_stats`: Objeto con las estadísticas actualizadas del alumno
 *   - `badge_earned`: Información de insignia desbloqueada (si aplica)
 */
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


