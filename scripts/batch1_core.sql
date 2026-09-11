-- Temporarily make handle_new_user a no-op to prevent duplicate inserts during migration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$ 
BEGIN 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Clear initial seed placeholder rows so exact foreign key UUIDs from source match
DELETE FROM public.nem_pdas;
DELETE FROM public.nem_campos_formativos;
DELETE FROM public.levels_grades;

INSERT INTO auth.users ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous")
VALUES
  ('00000000-0000-0000-0000-000000000000', 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33', 'authenticated', 'authenticated', 'santi@iskool.edu.mx', '$2a$06$YLX.bg9mFbMGqaNsh3twCOswmQUg4myyAoZYDzQH9hIexxsis4hby', '2026-06-20T04:26:36.944632+00:00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-09-04T19:35:50.797784+00:00', '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"student","last_name":"Gómez","first_name":"Santi"}'::jsonb, NULL, '2026-06-20T04:26:36.944632+00:00', '2026-09-04T21:29:52.269952+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, FALSE, NULL, FALSE),
  ('00000000-0000-0000-0000-000000000000', 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22', 'authenticated', 'authenticated', 'elena@iskool.edu.mx', '$2a$06$FP63pvvqvfxtIYsynsiH1OsmOMmYuDdeE2EDDuQWZLrU7oXDCiINO', '2026-06-20T04:26:36.944632+00:00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-09-04T18:24:26.643584+00:00', '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"student","last_name":"Rostova","first_name":"Elena"}'::jsonb, NULL, '2026-06-20T04:26:36.944632+00:00', '2026-09-04T18:24:26.648759+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, FALSE, NULL, FALSE),
  ('00000000-0000-0000-0000-000000000000', 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55', 'authenticated', 'authenticated', 'israel.lopez@iskool.edu.mx', '$2a$06$FvgyyKDqwm5B7HwHiQtuYeHULOm50R2bAG/orqpU4IAxLOtqrOIxS', '2026-06-20T04:26:36.944632+00:00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-31T18:11:36.634467+00:00', '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"teacher","last_name":"López","first_name":"Israel"}'::jsonb, NULL, '2026-06-20T04:26:36.944632+00:00', '2026-09-02T04:00:48.254679+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, FALSE, NULL, FALSE),
  ('00000000-0000-0000-0000-000000000000', '35c3de4a-174f-4a56-b870-4da5c14ab9b4', 'authenticated', 'authenticated', 'israel.lopez@ejemplo.com', '$2a$10$xiv8MJv4xU4sD/lYJtS6Zek8gnKUvBmrwI17OnDxxM/rZv1thHuii', NULL, NULL, '16ca20d540077c188e65f9a08086d8c9ecffd6281ee2672e3be54e42', '2026-08-27T01:08:02.2603+00:00', '', NULL, '', '', NULL, NULL, '{"provider":"email","providers":["email"]}'::jsonb, '{"sub":"35c3de4a-174f-4a56-b870-4da5c14ab9b4","role":"student","email":"israel.lopez@ejemplo.com","last_name":"Demo","first_name":"Usuario","email_verified":false,"phone_verified":false}'::jsonb, NULL, '2026-08-27T01:08:02.231156+00:00', '2026-08-27T01:08:03.32901+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, FALSE, NULL, FALSE),
  ('00000000-0000-0000-0000-000000000000', 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11', 'authenticated', 'authenticated', 'lucas@iskool.edu.mx', '$2a$06$cIv7DUswchSnNbGjX1bb/.Gku5Hnb.MonsnmNzqYsR/37vfb8jHvC', '2026-06-20T04:26:36.944632+00:00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-09-11T02:48:31.924973+00:00', '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"student","last_name":"Skywalker","first_name":"Lucas"}'::jsonb, NULL, '2026-06-20T04:26:36.944632+00:00', '2026-09-11T02:48:31.927146+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, FALSE, NULL, FALSE),
  ('00000000-0000-0000-0000-000000000000', 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44', 'authenticated', 'authenticated', 'mateo@iskool.edu.mx', '$2a$06$AaNuakYjhcoGWtXMQg4FO.oFwmS2evKUlEinzIYLOxPYObkAOkRsS', '2026-06-20T04:26:36.944632+00:00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-09-11T02:59:50.239248+00:00', '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"student","last_name":"Díaz","first_name":"Mateo"}'::jsonb, NULL, '2026-06-20T04:26:36.944632+00:00', '2026-09-11T02:59:50.273932+00:00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, FALSE, NULL, FALSE)
ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password, email_confirmed_at = EXCLUDED.email_confirmed_at, raw_app_meta_data = EXCLUDED.raw_app_meta_data, raw_user_meta_data = EXCLUDED.raw_user_meta_data;

INSERT INTO auth.identities ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id")
VALUES
  ('35c3de4a-174f-4a56-b870-4da5c14ab9b4', '35c3de4a-174f-4a56-b870-4da5c14ab9b4', '{"sub":"35c3de4a-174f-4a56-b870-4da5c14ab9b4","role":"student","email":"israel.lopez@ejemplo.com","last_name":"Demo","first_name":"Usuario","email_verified":false,"phone_verified":false}'::jsonb, 'email', '2026-08-27T01:08:02.256808+00:00', '2026-08-27T01:08:02.256851+00:00', '2026-08-27T01:08:02.256851+00:00', '0a728963-133f-408f-aaf4-43f53439274e')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.schools ("id", "name", "cct", "address", "phone", "created_at")
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Escuela Demo ISkool', NULL, NULL, NULL, '2026-06-20T04:26:36.944632+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles ("id", "first_name", "last_name", "role", "email", "phone", "created_at", "updated_at")
VALUES
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lucas', 'Skywalker', 'student', 'lucas@iskool.edu.mx', NULL, '2026-06-20T04:26:36.944632+00:00', '2026-06-20T04:26:36.944632+00:00'),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22', 'Elena', 'Rostova', 'student', 'elena@iskool.edu.mx', NULL, '2026-06-20T04:26:36.944632+00:00', '2026-06-20T04:26:36.944632+00:00'),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33', 'Santi', 'Gómez', 'student', 'santi@iskool.edu.mx', NULL, '2026-06-20T04:26:36.944632+00:00', '2026-06-20T04:26:36.944632+00:00'),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44', 'Mateo', 'Díaz', 'student', 'mateo@iskool.edu.mx', NULL, '2026-06-20T04:26:36.944632+00:00', '2026-06-20T04:26:36.944632+00:00'),
  ('c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55', 'Israel', 'López', 'teacher', 'israel.lopez@iskool.edu.mx', NULL, '2026-06-20T04:26:36.944632+00:00', '2026-06-20T04:26:36.944632+00:00'),
  ('35c3de4a-174f-4a56-b870-4da5c14ab9b4', 'Usuario', 'Demo', 'student', 'israel.lopez@ejemplo.com', NULL, '2026-08-27T01:08:02.230092+00:00', '2026-08-27T01:08:02.230092+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.school_settings ("id", "name", "website", "logo_url", "cct", "address", "phone", "coordinators", "teachers", "theme_colors", "is_configured", "created_at", "updated_at")
VALUES
  ('00000000-0000-0000-0000-000000000000', 'UP Juan Jacobo Rosseau', 'https://jjrosseau.edu.mx', '', '09PPR2026R', 'Calzada de los Filósofos 1712, Col. Del Valle, Ciudad de México', '55-4160-8800', ARRAY['Lic. Alejandro Valdés', 'Mtra. Patricia Mendoza']::text[], ARRAY['Prof. Israel López', 'Profa. María Fernández', 'Prof. Roberto Díaz', 'Profa. Carmen Morales', 'Prof. David Navarrete', 'Profa. Elena Salazar', 'Prof. Fernando Rangel']::text[], '{"accent":"308 38% 46%","primary":"220 24% 20%","secondary":"12 84% 54%"}'::jsonb, TRUE, '2026-06-21T01:25:34.058021+00:00', '2026-09-06T14:54:54.99+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.levels_grades ("id", "level_name", "grade_name", "created_at")
VALUES
  ('e84a8daf-b00c-4802-ba65-4e19784f9b46', 'primaria', '1º', '2026-06-20T03:29:18.649684+00:00'),
  ('a6bcd408-c95f-4dc3-9e68-149e78d2e5e5', 'primaria', '2º', '2026-06-20T03:29:18.649684+00:00'),
  ('617b69ee-2c58-4f82-ba61-4a52624cb3e5', 'primaria', '3º', '2026-06-20T03:29:18.649684+00:00'),
  ('1111c019-61c7-4097-8aca-03cc0c4db68a', 'primaria', '4º', '2026-06-20T03:29:18.649684+00:00'),
  ('d84b5cd4-b24d-4908-b777-9d64f2cf9d81', 'primaria', '5º', '2026-06-20T03:29:18.649684+00:00'),
  ('4544e750-4c7b-4026-bba7-a651e1c21495', 'primaria', '6º', '2026-06-20T03:29:18.649684+00:00'),
  ('f507ac1a-2e3b-40e3-9e51-2223c3b76c78', 'secundaria', '1º', '2026-06-20T03:29:18.649684+00:00'),
  ('b35cc0cd-55a8-489c-9b92-19074e00fdab', 'secundaria', '2º', '2026-06-20T03:29:18.649684+00:00'),
  ('7b3dcd71-d7ec-4880-b32f-e8b74ed0dcf4', 'secundaria', '3º', '2026-06-20T03:29:18.649684+00:00'),
  ('ea723885-e471-4792-bb6c-a5aec3ef9239', 'preparatoria', '1º Semestre', '2026-06-20T03:29:18.649684+00:00'),
  ('a8f80585-4624-41c4-9d9f-7ee4a929c649', 'preparatoria', '2º Semestre', '2026-06-20T03:29:18.649684+00:00'),
  ('23184590-2c28-4f2d-a4de-9c839156f353', 'preparatoria', '3º Semestre', '2026-06-20T03:29:18.649684+00:00'),
  ('9e7a9187-f1fb-49fa-9ebc-e02f0b45c198', 'preparatoria', '4º Semestre', '2026-06-20T03:29:18.649684+00:00'),
  ('67bbbc85-d22f-409e-ae2a-fa277333be76', 'preparatoria', '5º Semestre', '2026-06-20T03:29:18.649684+00:00'),
  ('63943a3d-ab78-4cd6-8b81-5a606f180ebd', 'preparatoria', '6º Semestre', '2026-06-20T03:29:18.649684+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.nem_campos_formativos ("id", "name", "created_at")
VALUES
  ('9eda58a3-bda0-4824-9fe6-b2ed6095ad5b', 'Lenguajes', '2026-07-15T06:03:35.636468+00:00'),
  ('34e4f5d5-2954-4f1d-bc77-8709c8953fe1', 'Saberes', '2026-07-15T06:03:35.636468+00:00'),
  ('182e477b-cbcb-4419-bfd2-f2fc02089139', 'Ética', '2026-07-15T06:03:35.636468+00:00'),
  ('0678f737-6c1a-43fd-8c72-5cb905159f00', 'De lo Humano', '2026-07-15T06:03:35.636468+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.nem_pdas ("id", "campo_formativo_id", "code", "description", "created_at")
VALUES
  ('b64e5f7b-93c5-4c4a-bd8d-5c79f19daa04', '9eda58a3-bda0-4824-9fe6-b2ed6095ad5b', 'PDA-LENG-01', 'Expresa oralmente ideas y emociones de manera lógica y coherente.', '2026-07-15T06:03:35.636468+00:00'),
  ('177c84d9-bfba-477d-9364-ce1464e974c0', '9eda58a3-bda0-4824-9fe6-b2ed6095ad5b', 'PDA-LENG-02', 'Lee y comprende diversos tipos de textos informativos y literarios.', '2026-07-15T06:03:35.636468+00:00'),
  ('2581415d-4e97-49dc-8d5c-2e97055a96a3', '34e4f5d5-2954-4f1d-bc77-8709c8953fe1', 'PDA-SAB-01', 'Resuelve problemas que implican sumas, restas, multiplicaciones y divisiones.', '2026-07-15T06:03:35.636468+00:00'),
  ('d045af87-7ebe-4fc8-960c-082b5813e60c', '34e4f5d5-2954-4f1d-bc77-8709c8953fe1', 'PDA-SAB-02', 'Identifica y describe patrones de comportamiento en la naturaleza.', '2026-07-15T06:03:35.636468+00:00'),
  ('15539fe7-75b1-4a34-8067-d9c26344d944', '182e477b-cbcb-4419-bfd2-f2fc02089139', 'PDA-ETI-01', 'Reconoce los derechos humanos y practica valores éticos fundamentales.', '2026-07-15T06:03:35.636468+00:00'),
  ('ed13fbe1-d6ee-49c4-bfb8-ac0875990262', '182e477b-cbcb-4419-bfd2-f2fc02089139', 'PDA-ETI-02', 'Propone acciones para cuidar la biodiversidad y el medio ambiente local.', '2026-07-15T06:03:35.636468+00:00'),
  ('5bf62d53-86b2-4cab-86d8-4f5e806a51a6', '0678f737-6c1a-43fd-8c72-5cb905159f00', 'PDA-HUM-01', 'Reflexiona sobre sus propios sentimientos y empatiza con los de sus compañeros.', '2026-07-15T06:03:35.636468+00:00'),
  ('649f12ad-0455-48ae-bf27-88d99c1cb4e4', '0678f737-6c1a-43fd-8c72-5cb905159f00', 'PDA-HUM-02', 'Participa activamente en dinámicas de colaboración grupal y autocuidado.', '2026-07-15T06:03:35.636468+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.subjects ("id", "school_id", "level_grade_id", "name", "sep_code", "created_at")
VALUES
  ('b00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e11', '00000000-0000-0000-0000-000000000000', '1111c019-61c7-4097-8aca-03cc0c4db68a', 'Matemáticas', 'SUB-MATH', '2026-06-20T19:28:13.004761+00:00'),
  ('5d97d8be-fd43-42c4-97b4-b162d64fa043', '00000000-0000-0000-0000-000000000000', '1111c019-61c7-4097-8aca-03cc0c4db68a', 'Español', '', '2026-07-08T07:04:42.818814+00:00'),
  ('9a4370bc-a8db-47ee-9076-920579ee1f38', '00000000-0000-0000-0000-000000000000', '1111c019-61c7-4097-8aca-03cc0c4db68a', 'Español', '', '2026-07-08T07:04:42.933338+00:00'),
  ('f6ec66ef-c3f1-464f-8903-fd612fc7b7cb', '00000000-0000-0000-0000-000000000000', '1111c019-61c7-4097-8aca-03cc0c4db68a', 'Ciencias Naturales', 'SUB-SCI', '2026-08-27T21:42:22.305485+00:00')
ON CONFLICT (id) DO NOTHING;
