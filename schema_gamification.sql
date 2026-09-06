-- ISkool Academic Gamification and Portfolio Schema Extension
-- Database: PostgreSQL (Supabase)

-- 1. Student Stats (Experiencia, nivel, rachas y atributos de RPG para Secundaria)
/**
 * @table student_stats
 * @description Almacena las estadísticas de gamificación y progresión de nivel de un estudiante. Contiene datos de RPG (Secundaria) y financiamiento (Preparatoria).
 * @relation Vinculado a `public.students` (1:1) mediante `student_id` con cascada de eliminación.
 * @stateImpact Cargado y administrado por `useStudentStore` (`stats`, `activeStudentId`). Actualizado al ganar XP/Coins o gastar skill_points.
 */
create table public.student_stats (
  student_id uuid references public.students(id) on delete cascade primary key,
  xp integer default 0 not null check (xp >= 0),
  level integer default 1 not null check (level >= 1),
  coins integer default 0 not null check (coins >= 0),
  current_streak integer default 0 not null check (current_streak >= 0),
  max_streak integer default 0 not null check (max_streak >= 0),
  last_active_date date,
  
  -- Atributos RPG (Secundaria)
  rpg_class text check (rpg_class in ('guerrero', 'mago', 'curandero', 'explorador')),
  attribute_strength integer default 10 check (attribute_strength >= 0),
  attribute_intelligence integer default 10 check (attribute_intelligence >= 0),
  attribute_defense integer default 10 check (attribute_defense >= 0),
  skill_points integer default 0 check (skill_points >= 0),
  
  -- Financiamiento (Preparatoria)
  funding_credits integer default 1000 check (funding_credits >= 0),
  
  -- Tamagotchi RPG Mascotas (Secundaria)
  pet_stage varchar default 'egg' check (pet_stage in ('egg', 'baby', 'adult', 'mystic')),
  pet_energy integer default 100 check (pet_energy >= 0 and pet_energy <= 100),
  pet_happiness integer default 50 check (pet_happiness >= 0 and pet_happiness <= 100),
  
  -- Afinidades Elementales / Stats NEM (Nueva Escuela Mexicana)
  stat_lenguajes integer default 0 not null check (stat_lenguajes >= 0),
  stat_saberes integer default 0 not null check (stat_saberes >= 0),
  stat_etica integer default 0 not null check (stat_etica >= 0),
  stat_de_lo_humano integer default 0 not null check (stat_de_lo_humano >= 0),
  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.student_stats enable row level security;

-- Políticas RLS para student_stats (Aislamiento por colegio)
create policy "Aislamiento estricto de student_stats por colegio"
  on public.student_stats for select
  to authenticated
  using (
    auth.uid() = student_id 
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() 
        and p.role = 'superadmin'
    )
    or exists (
      select 1 from public.students s
      join public.profiles p on p.school_id = s.school_id
      where s.id = student_stats.student_id
        and p.id = auth.uid()
        and p.role in ('teacher', 'admin', 'director', 'coordinator')
    )
  );

create policy "Permitir insercion de student_stats al propio alumno"
  on public.student_stats for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Permitir actualizacion de student_stats al propio alumno"
  on public.student_stats for update
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- 2. Student Avatars (Personalización de Avatar y Mascota para Primaria Baja)
/**
 * @table student_avatars
 * @description Configuración estética del avatar del alumno (personalización) y estado de su mascota virtual (exclusivo para Primaria Baja).
 * @relation Vinculado a `public.students` (1:1) mediante `student_id` con cascada de eliminación.
 * @stateImpact Leído y modificado en `useStudentStore` mediante `changeAvatar` y actualización de mascota.
 */
create table public.student_avatars (
  student_id uuid references public.students(id) on delete cascade primary key,
  avatar_name text not null default 'Explorador',
  hair_style text not null default 'classic',
  hair_color text not null default '#4B5563',
  eyes_style text not null default 'happy',
  outfit_style text not null default 'space_suit',
  outfit_color text not null default '#3B82F6',
  background_style text not null default 'nebula',
  unlocked_items text[] default array['classic', 'happy', 'space_suit', 'nebula']::text[] not null,
  
  -- Mascota Virtual (Primaria Baja)
  pet_type text default 'dragon' check (pet_type in ('dragon', 'gatito', 'osito')),
  pet_name text default 'Chispas' not null,
  pet_hunger integer default 50 check (pet_hunger >= 0 and pet_hunger <= 100),
  pet_happiness integer default 50 check (pet_happiness >= 0 and pet_happiness <= 100),
  pet_outfit text default 'none',
  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.student_avatars enable row level security;

-- Políticas RLS para student_avatars (Visualización comunitaria, mutación exclusiva del dueño)
create policy "Permitir lectura de student_avatars a usuarios autenticados"
  on public.student_avatars for select
  to authenticated
  using (true);

create policy "Permitir insercion de student_avatars al propio alumno"
  on public.student_avatars for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Permitir actualizacion de student_avatars al propio alumno"
  on public.student_avatars for update
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- 3. Badges / Insignias (Catálogo)
/**
 * @table badges
 * @description Catálogo global de insignias y medallas académicas, sociales, de persistencia y creativas.
 * @relation Referenciado por `public.student_badges` (1:N) para mapear medallas ganadas.
 * @stateImpact Listado global en la tienda de medallas de `useGamificationStore` (`badges`).
 */
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  icon_name text not null, -- Nombre del icono a renderizar (Lucide React)
  category text not null check (category in ('academic', 'social', 'persistence', 'creative')),
  xp_required integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.badges enable row level security;

create policy "Permitir lectura de catalogo de insignias a usuarios autenticados"
  on public.badges for select
  to authenticated
  using (true);

-- 4. Student Badges (Relación de insignias obtenidas)
/**
 * @table student_badges
 * @description Relación de unión que registra qué insignias ha obtenido cada estudiante y la fecha de obtención.
 * @relation Vincula `public.students` (N:1) y `public.badges` (N:1).
 * @stateImpact Administrado y actualizado por `unlockBadge` en `useGamificationStore`.
 */
create table public.student_badges (
  student_id uuid references public.students(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (student_id, badge_id)
);

alter table public.student_badges enable row level security;

create policy "Permitir lectura de insignias de alumnos a usuarios autenticados"
  on public.student_badges for select
  to authenticated
  using (true);

create policy "Permitir insercion de insignias al propio alumno"
  on public.student_badges for insert
  to authenticated
  with check (auth.uid() = student_id);

-- 4.5. NEM Catalog Tables (Nueva Escuela Mexicana)
/**
 * @table nem_campos_formativos
 * @description Catálogo estático de campos formativos según el plan de estudios NEM.
 */
create table public.nem_campos_formativos (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.nem_campos_formativos enable row level security;

create policy "Permitir lectura de campos formativos a usuarios autenticados"
  on public.nem_campos_formativos for select
  to authenticated
  using (true);

/**
 * @table nem_pdas
 * @description Procesos de Desarrollo de Aprendizaje (PDAs) asociados a campos formativos.
 */
create table public.nem_pdas (
  id uuid default uuid_generate_v4() primary key,
  campo_formativo_id uuid references public.nem_campos_formativos(id) on delete cascade not null,
  code text,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.nem_pdas enable row level security;

create policy "Permitir lectura de PDAs a usuarios autenticados"
  on public.nem_pdas for select
  to authenticated
  using (true);

-- 5. Missions / Misiones Académicas (Narrativa de aprendizaje)
/**
 * @table missions
 * @description Misión del mapa de aprendizaje narrativo de una materia para un grado específico.
 * @relation Pertenece a `public.schools` (N:1), `public.subjects` (N:1), y `public.levels_grades` (N:1). Padre de `public.quests` (1:N).
 * @stateImpact Cargado dinámicamente mediante `fetchMissions` en `useGamificationStore` (`missions`).
 */
create table public.missions (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  level_grade_id uuid references public.levels_grades(id) on delete cascade not null,
  campo_formativo_id uuid references public.nem_campos_formativos(id) on delete set null,
  pda_ids uuid[],
  title text not null,
  description text not null,
  story_intro text not null, -- Texto introductorio de la narrativa
  map_position_x integer not null, -- Coordenada X para el mapa de misiones
  map_position_y integer not null, -- Coordenada Y para el mapa de misiones
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.missions enable row level security;

create policy "Permitir lectura de misiones a usuarios autenticados"
  on public.missions for select
  to authenticated
  using (true);

-- 6. Quests / Retos (Actividades dentro de una misión)
/**
 * @table quests
 * @description Reto o actividad académica (cuestionario, examen o entrega de portafolio) dentro de una misión.
 * @relation Pertenece a `public.missions` (N:1). Referenciado por `public.quest_attempts` (1:N) y `public.portfolio_items` (1:N).
 * @stateImpact Determina las preguntas, recompensas de XP/monedas y formato de evidencias renderizados en la UI.
 */
create table public.quests (
  id uuid default uuid_generate_v4() primary key,
  mission_id uuid references public.missions(id) on delete cascade not null,
  campo_formativo_id uuid references public.nem_campos_formativos(id) on delete set null,
  pda_ids uuid[],
  title text not null,
  description text not null,
  type text not null check (type in ('quiz', 'portfolio_submission', 'reading', 'reading_comprehension')),
  sequence_order integer not null,
  xp_reward integer default 50 not null,
  coins_reward integer default 10 not null,
  content jsonb not null, -- Cuestionario o instrucciones de la entrega
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (mission_id, sequence_order)
);

alter table public.quests enable row level security;

create policy "Permitir lectura de retos a usuarios autenticados"
  on public.quests for select
  to authenticated
  using (true);

-- 7. Quest Attempts (Intentos y reintentos - El error como aprendizaje)
/**
 * @table quest_attempts
 * @description Registro histórico de los intentos realizados por un estudiante para resolver un reto (quest). Permite registrar el progreso, respuestas y feedback.
 * @relation Vincula `public.students` (N:1) y `public.quests` (N:1).
 * @stateImpact Creado al completar un reto. Afecta los estados de `useGamificationStore` (`submitQuiz`, `submitExam`).
 */
create table public.quest_attempts (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  quest_id uuid references public.quests(id) on delete cascade not null,
  score numeric(5,2) not null, -- Puntuación obtenida (porcentaje 0.00 a 100.00)
  is_completed boolean default false not null,
  answers jsonb, -- Respuestas dadas por el alumno
  feedback text, -- Retroalimentación automática
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quest_attempts enable row level security;

-- Políticas RLS para quest_attempts (Aislamiento por colegio)
create policy "Aislamiento estricto de quest_attempts por colegio"
  on public.quest_attempts for select
  to authenticated
  using (
    auth.uid() = student_id 
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() 
        and p.role = 'superadmin'
    )
    or exists (
      select 1 from public.students s
      join public.profiles p on p.school_id = s.school_id
      where s.id = quest_attempts.student_id
        and p.id = auth.uid()
        and p.role in ('teacher', 'admin', 'director', 'coordinator')
    )
  );

create policy "Permitir a estudiantes registrar sus propios intentos"
  on public.quest_attempts for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Permitir a estudiantes actualizar sus propios intentos"
  on public.quest_attempts for update
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- 8. Portfolio Items (Portafolio Digital de Evidencias - Seesaw-style)
/**
 * @table portfolio_items
 * @description Portafolio digital de evidencias de aprendizaje (estilo Seesaw) donde los estudiantes suben tareas para evaluación docente.
 * @relation Vincula `public.students` (N:1), `public.subjects` (N:1), y opcionalmente `public.quests` (N:1). Padre de `public.portfolio_feedback` (1:N).
 * @stateImpact Administrado por `usePortfolioStore` (`portfolioItems`). Sujeto a políticas RLS por estudiante y por grupo para docentes.
 */
create table public.portfolio_items (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  quest_id uuid references public.quests(id) on delete cascade, -- Opcional
  title text not null,
  description text,
  file_url text not null,
  file_type text not null check (file_type in ('image', 'audio', 'video', 'pdf', 'link')),
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'approved', 'needs_revision')),
  self_reflection text, -- Reflexión del propio alumno (Autoevaluación)
  
  -- Coevaluación y Proyectos de Preparatoria
  peer_review_score numeric(3,1) check (peer_review_score >= 0.0 and peer_review_score <= 10.0),
  peer_review_comments text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.portfolio_items enable row level security;

-- Políticas RLS para portfolio_items (Aislamiento de portafolio por colegio)
create policy "Aislamiento estricto de portfolio_items por colegio"
  on public.portfolio_items for select
  to authenticated
  using (
    auth.uid() = student_id 
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() 
        and p.role = 'superadmin'
    )
    or exists (
      select 1 from public.students s
      join public.profiles p on p.school_id = s.school_id
      where s.id = portfolio_items.student_id
        and p.id = auth.uid()
        and p.role in ('teacher', 'admin', 'director', 'coordinator')
    )
    or exists (
      select 1 from public.parent_student ps
      where ps.student_id = portfolio_items.student_id 
        and ps.parent_id = auth.uid()
    )
    or peer_review_score is not null
  );

create policy "Permitir a estudiantes subir sus propias evidencias"
  on public.portfolio_items for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Permitir a estudiantes editar sus evidencias o docentes calificar"
  on public.portfolio_items for update
  to authenticated
  using (
    auth.uid() = student_id 
    or exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
        and profiles.role in ('teacher', 'admin', 'director', 'superadmin')
    )
  );

create policy "Permitir a estudiantes eliminar sus propias evidencias"
  on public.portfolio_items for delete
  to authenticated
  using (auth.uid() = student_id);

-- 9. Portfolio Feedback (Retroalimentación Formativa - Multidireccional)
/**
 * @table portfolio_feedback
 * @description Retroalimentación formativa y multidireccional (de profesores, padres o compañeros) a una evidencia del portafolio.
 * @relation Pertenece a `public.portfolio_items` (N:1). Escrito por un perfil de usuario en `public.profiles` (N:1).
 * @stateImpact Actualizado en tiempo real en la vista de evidencias en `usePortfolioStore` (`addPortfolioFeedback`).
 */
create table public.portfolio_feedback (
  id uuid default uuid_generate_v4() primary key,
  portfolio_item_id uuid references public.portfolio_items(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  author_role text not null check (author_role in ('teacher', 'parent', 'student', 'peer')),
  feedback_text text not null,
  reactions jsonb default '{}'::jsonb not null, -- Emojis de apoyo
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.portfolio_feedback enable row level security;

-- Políticas RLS para portfolio_feedback
create policy "Permitir lectura de feedback formativo a usuarios autenticados"
  on public.portfolio_feedback for select
  to authenticated
  using (true);

create policy "Permitir creacion de feedback al autor autenticado"
  on public.portfolio_feedback for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Permitir modificacion de feedback al autor original"
  on public.portfolio_feedback for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Permitir eliminacion de feedback al autor original"
  on public.portfolio_feedback for delete
  to authenticated
  using (auth.uid() = author_id);

-- Seed inicial de Insignias
insert into public.badges (name, description, icon_name, category, xp_required) values
  ('Matemago de Bronce', 'Resuelve tu primera misión de Matemáticas con racha perfecta.', 'Calculator', 'academic', 100),
  ('Lector de las Galaxias', 'Sube un audio leyendo en voz alta al portafolio.', 'BookOpen', 'academic', 150),
  ('Espíritu Indomable', 'Completa un reto después de haber fallado en el primer intento.', 'Sparkles', 'persistence', 200),
  ('Creador de Universos', 'Sube una evidencia artística o dibujo digital de alta calidad.', 'Palette', 'creative', 150),
  ('Compañero Estelar', 'Realiza una coevaluación constructiva para un compañero.', 'Users', 'social', 100),
  ('Racha del Sol', 'Mantén una racha de actividad diaria de 5 días seguidos.', 'Flame', 'persistence', 300);

-- ==========================================
-- 10. Coop Parties (Sesiones Cooperativas)
-- ==========================================
create table public.coop_parties (
  id uuid default uuid_generate_v4() primary key,
  mission_id uuid references public.missions(id) on delete cascade not null,
  created_by uuid references public.students(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coop_parties enable row level security;

-- Políticas RLS para coop_parties
create policy "Permitir lectura de coop_parties a usuarios autenticados"
  on public.coop_parties for select
  to authenticated
  using (true);

create policy "Permitir a estudiantes crear su propia party"
  on public.coop_parties for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Permitir a creadores y miembros actualizar el estado de la party"
  on public.coop_parties for update
  to authenticated
  using (
    auth.uid() = created_by 
    or exists (
      select 1 from public.party_members 
      where party_members.party_id = coop_parties.id 
        and party_members.student_id = auth.uid()
    )
  );


-- ==========================================
-- 11. Party Members (Miembros de la Party)
-- ==========================================
create table public.party_members (
  party_id uuid references public.coop_parties(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (party_id, student_id)
);

alter table public.party_members enable row level security;

-- Políticas RLS para party_members
create policy "Permitir lectura de party_members a usuarios autenticados"
  on public.party_members for select
  to authenticated
  using (true);

create policy "Permitir a estudiantes unirse a una party"
  on public.party_members for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Permitir a estudiantes salir de una party"
  on public.party_members for delete
  to authenticated
  using (auth.uid() = student_id);


-- ==========================================
-- 12. Party Actions (Acciones/Ataques en Tiempo Real)
-- ==========================================
create table public.party_actions (
  id uuid default uuid_generate_v4() primary key,
  party_id uuid references public.coop_parties(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  damage_dealt integer not null check (damage_dealt >= 0),
  action_type text not null, -- e.g., 'attack', 'heal', 'spell'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.party_actions enable row level security;

-- Políticas RLS para party_actions
create policy "Permitir lectura de party_actions a usuarios autenticados"
  on public.party_actions for select
  to authenticated
  using (true);

create policy "Permitir a miembros registrar sus propias acciones"
  on public.party_actions for insert
  to authenticated
  with check (
    auth.uid() = student_id 
    and exists (
      select 1 from public.party_members 
      where party_members.party_id = party_actions.party_id 
        and party_members.student_id = auth.uid()
    )
  );

-- Habilitar Supabase Realtime para la tabla party_actions
alter publication supabase_realtime add table public.party_actions;

-- ==========================================
-- 13. RPC Function: Join Party
-- ==========================================
create or replace function public.join_party(party_id_param uuid)
returns void as $$
declare
  v_mission_id uuid;
  v_mission_active boolean;
  v_party_status text;
  v_student_id uuid;
begin
  -- Obtener el ID del estudiante desde la sesión activa
  v_student_id := auth.uid();
  if v_student_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  -- Validar si la party existe y su estado
  select mission_id, status into v_mission_id, v_party_status
  from public.coop_parties
  where id = party_id_param;

  if not found then
    raise exception 'La sala a la que intentas unirte ya no existe o ha caducado';
  end if;

  if v_party_status != 'active' then
    raise exception 'La sala a la que intentas unirte ya no existe o ha caducado';
  end if;

  -- Validar si la misión está activa
  select is_active into v_mission_active
  from public.missions
  where id = v_mission_id;

  if not found or not v_mission_active then
    raise exception 'La misión asociada a esta sala no está activa';
  end if;

  -- Validar si el alumno ya pertenece a otra sesión activa
  if exists (
    select 1 
    from public.party_members pm
    join public.coop_parties cp on pm.party_id = cp.id
    where pm.student_id = v_student_id
      and cp.status = 'active'
      and cp.id != party_id_param
  ) then
    raise exception 'Ya perteneces a otra sesión activa de party';
  end if;

  -- Registrar al alumno en la party
  insert into public.party_members (party_id, student_id)
  values (party_id_param, v_student_id)
  on conflict (party_id, student_id) do nothing;
end;
$$ language plpgsql security definer SET search_path = public, pg_catalog, pg_temp;

-- ==========================================
-- 14. Reading Metrics (Comprensión Lectora y Pensamiento Lógico)
-- ==========================================
/**
 * @table reading_metrics
 * @description Almacena los registros de desempeño, fluidez lectora (PPM), comprensión y tiempo del estudiante en retos de lectura y lógica.
 * @relation Vincula `public.students` (N:1) y opcionalmente `public.quests` (N:1).
 * @stateImpact Utilizado para calcular progresión en el campo formativo de Lenguajes, alimentar analíticas pedagógicas y asignar recompensas.
 */
create table public.reading_metrics (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  quest_id uuid references public.quests(id) on delete set null,
  words_per_minute integer not null check (words_per_minute >= 0), -- PPM (Palabras por minuto)
  comprehension_score numeric(5,2) not null check (comprehension_score >= 0.00 and comprehension_score <= 100.00), -- Porcentaje de aciertos (0.00% a 100.00%)
  time_spent_seconds integer not null check (time_spent_seconds >= 0), -- Tiempo invertido en la lectura y evaluación
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reading_metrics enable row level security;

-- Políticas RLS para reading_metrics (Aislamiento de métricas y privacidad del estudiante)
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

create policy "Permitir a estudiantes registrar sus propias métricas de lectura"
  on public.reading_metrics for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Permitir a estudiantes actualizar sus propias métricas de lectura"
  on public.reading_metrics for update
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);


-- ==========================================
-- 15. RPC Function: submit_reading_quest
-- ==========================================
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



