INSERT INTO public.students ("id", "school_id", "curp", "birth_date", "enrollment_id", "created_at")
VALUES
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11', '00000000-0000-0000-0000-000000000000', NULL, NULL, NULL, '2026-06-20T04:26:36.944632+00:00'),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22', '00000000-0000-0000-0000-000000000000', NULL, NULL, NULL, '2026-06-20T04:26:36.944632+00:00'),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33', '00000000-0000-0000-0000-000000000000', NULL, NULL, NULL, '2026-06-20T04:26:36.944632+00:00'),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44', '00000000-0000-0000-0000-000000000000', NULL, NULL, NULL, '2026-06-20T04:26:36.944632+00:00'),
  ('35c3de4a-174f-4a56-b870-4da5c14ab9b4', '00000000-0000-0000-0000-000000000000', NULL, NULL, NULL, '2026-08-27T01:08:02.230092+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.student_stats ("student_id", "xp", "level", "coins", "current_streak", "max_streak", "last_active_date", "rpg_class", "attribute_strength", "attribute_intelligence", "attribute_defense", "skill_points", "funding_credits", "updated_at", "pet_stage", "pet_energy", "pet_happiness", "stat_lenguajes", "stat_saberes", "stat_etica", "stat_de_lo_humano")
VALUES
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44', 190, 3, 160, 8, 8, '2026-09-11', NULL, 10, 10, 10, 4, 1250, '2026-09-11T03:00:21.028+00:00', 'egg', 100, 50, 0, 0, 0, 0),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11', 185, 3, 102, 8, 8, '2026-09-11', NULL, 10, 10, 10, 2, 1000, '2026-09-11T15:36:45.313+00:00', 'baby', 100, 100, 0, 0, 0, 0),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33', 250, 2, 55, 3, 3, '2026-08-06', NULL, 10, 10, 10, 2, 1000, '2026-08-06T02:52:25.523+00:00', 'egg', 100, 50, 0, 0, 0, 0),
  ('35c3de4a-174f-4a56-b870-4da5c14ab9b4', 0, 1, 0, 0, 0, NULL, NULL, 10, 10, 10, 0, 1000, '2026-08-27T01:08:02.230092+00:00', 'egg', 100, 50, 0, 0, 0, 0),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22', 225, 4, 200, 7, 7, '2026-08-31', 'mago', 8, 20, 13, 6, 1000, '2026-08-31T16:14:54.843+00:00', 'baby', 100, 90, 0, 0, 0, 0)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.student_avatars ("student_id", "avatar_name", "hair_style", "hair_color", "eyes_style", "outfit_style", "outfit_color", "background_style", "unlocked_items", "pet_type", "pet_name", "pet_hunger", "pet_happiness", "pet_outfit", "updated_at", "gender", "rpg_class", "head_type", "skin_tone", "race_feature", "body_scale", "equipped_shoes", "equipped_bottom", "equipped_top", "equipped_outerwear", "equipped_hat", "equipped_accessory", "wardrobe_inventory", "sanctuary_house_type", "sanctuary_placed_items", "sanctuary_inventory", "pet_bonded", "pet_birth_date")
VALUES
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22', 'Explorador', 'classic', '#4B5563', 'happy', 'space_suit', '#3B82F6', 'nebula', ARRAY['classic', 'happy', 'space_suit', 'nebula', 'corona_boss']::text[], 'dragon', 'Chispas', 50, 50, 'none', '2026-06-20T04:26:36.944632+00:00', 'female', 'mago', 'standard', '#FED7AA', 'human', 'normal', 'shoes_basic', 'bottom_basic', 'top_basic', 'outerwear_none', 'hat_none', 'acc_none', ARRAY['shoes_basic', 'bottom_basic', 'top_basic']::text[], 'forest_cabin', '{}'::jsonb, ARRAY[]::text[], FALSE, NULL),
  ('35c3de4a-174f-4a56-b870-4da5c14ab9b4', 'Explorador', 'classic', '#4B5563', 'happy', 'space_suit', '#3B82F6', 'nebula', ARRAY['classic', 'happy', 'space_suit', 'nebula']::text[], 'dragon', 'Chispas', 50, 50, 'none', '2026-08-27T01:08:02.230092+00:00', 'female', 'mago', 'standard', '#FED7AA', 'human', 'normal', 'shoes_basic', 'bottom_basic', 'top_basic', 'outerwear_none', 'hat_none', 'acc_none', ARRAY['shoes_basic', 'bottom_basic', 'top_basic']::text[], 'forest_cabin', '{}'::jsonb, ARRAY[]::text[], FALSE, NULL),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11', 'LucasAvatar', 'bantu_knots', '#F97316', 'scholar', 'space_suit', '#3B82F6', 'nebula', ARRAY['classic', 'happy', 'space_suit', 'nebula']::text[], 'gatito', 'Chispas', 60, 100, 'none', '2026-09-11T17:58:17.949+00:00', 'female', 'mago', 'standard', '#C2410C', 'stag_antlers', 'compact', 'shoes_basic', 'bottom_basic', 'top_basic', 'outerwear_none', 'hat_urban_cap', 'acc_none', ARRAY['shoes_basic', 'bottom_basic', 'top_basic']::text[], 'forest_cabin', '{}'::jsonb, ARRAY[]::text[], FALSE, NULL),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44', 'Explorador', 'sidecut', '#4B5563', 'happy', 'space_suit', '#3B82F6', 'nebula', ARRAY['classic', 'happy', 'space_suit', 'nebula']::text[], 'dragon', 'Chispas', 50, 50, 'none', '2026-06-20T04:26:36.944632+00:00', 'male', 'mago', 'standard', '#FED7AA', 'human', 'normal', 'shoes_basic', 'bottom_basic', 'top_basic', 'outerwear_none', 'hat_none', 'acc_none', ARRAY['shoes_basic', 'bottom_basic', 'top_basic']::text[], 'forest_cabin', '{}'::jsonb, ARRAY[]::text[], FALSE, NULL),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33', 'Explorador', 'spiky', '#EF4444', 'happy', 'space_suit', '#3B82F6', 'nebula', ARRAY['classic', 'happy', 'space_suit', 'nebula']::text[], 'dragon', 'Chispas', 50, 50, 'none', '2026-06-20T04:26:36.944632+00:00', 'female', 'mago', 'standard', '#FED7AA', 'human', 'normal', 'shoes_basic', 'bottom_basic', 'top_basic', 'outerwear_none', 'hat_none', 'acc_none', ARRAY['shoes_basic', 'bottom_basic', 'top_basic']::text[], 'forest_cabin', '{}'::jsonb, ARRAY[]::text[], FALSE, NULL)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.badges ("id", "name", "description", "icon_name", "category", "xp_required", "created_at")
VALUES
  ('83884124-d5cb-40c5-a663-fe8fb79d7246', 'Matemago de Bronce', 'Resuelve tu primera misión de Matemáticas con racha perfecta.', 'Calculator', 'academic', 100, '2026-06-20T03:29:24.17816+00:00'),
  ('8022ef59-816e-421b-bfdb-7acf1ad92f04', 'Lector de las Galaxias', 'Sube un audio leyendo en voz alta al portafolio.', 'BookOpen', 'academic', 150, '2026-06-20T03:29:24.17816+00:00'),
  ('7589cae0-556c-4190-8bdc-fe545a9e4b0e', 'Espíritu Indomable', 'Completa un reto después de haber fallado en el primer intento.', 'Sparkles', 'persistence', 200, '2026-06-20T03:29:24.17816+00:00'),
  ('70aaa111-88aa-4d3f-85b8-69508ace6bdd', 'Creador de Universos', 'Sube una evidencia artística o dibujo digital de alta calidad.', 'Palette', 'creative', 150, '2026-06-20T03:29:24.17816+00:00'),
  ('5e50c1fc-2435-4756-a83b-ffbc74f17f5f', 'Compañero Estelar', 'Realiza una coevaluación constructiva para un compañero.', 'Users', 'social', 100, '2026-06-20T03:29:24.17816+00:00'),
  ('44fa24b1-2a3d-4308-ab2c-d02c65b762f7', 'Racha del Sol', 'Mantén una racha de actividad diaria de 5 días seguidos.', 'Flame', 'persistence', 300, '2026-06-20T03:29:24.17816+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.student_badges ("student_id", "badge_id", "earned_at")
VALUES
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11', '8022ef59-816e-421b-bfdb-7acf1ad92f04', '2026-09-11T02:56:23.474329+00:00')
ON CONFLICT (student_id, badge_id) DO NOTHING;


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.email
  )
  ON CONFLICT (id) DO NOTHING;

  IF COALESCE(new.raw_user_meta_data->>'role', 'student') = 'student' THEN
    INSERT INTO public.students (id, school_id)
    VALUES (new.id, '00000000-0000-0000-0000-000000000000')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.student_stats (student_id)
    VALUES (new.id)
    ON CONFLICT (student_id) DO NOTHING;

    INSERT INTO public.student_avatars (student_id, avatar_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'first_name', 'Héroe'))
    ON CONFLICT (student_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
