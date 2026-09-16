-- =========================================================================
-- MIGRACIÓN: CATÁLOGO OFICIAL DE ARTEFACTOS DE PRODUCCIÓN Y METADATOS RÚNICOS
-- =========================================================================

-- 1. Añadir columnas de metadatos si no existen
ALTER TABLE public.shop_artifacts ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.shop_artifacts ADD COLUMN IF NOT EXISTS rarity text;
ALTER TABLE public.shop_artifacts ADD COLUMN IF NOT EXISTS effect text;
ALTER TABLE public.shop_artifacts ADD COLUMN IF NOT EXISTS detailed_effect text;
ALTER TABLE public.shop_artifacts ADD COLUMN IF NOT EXISTS mechanic text;

-- 2. Limpiar registros obsoletos de prueba (como los de 10100 monedas)
DELETE FROM public.shop_artifacts WHERE price >= 5000;

-- 3. Insertar / Actualizar el catálogo oficial de producción
INSERT INTO public.shop_artifacts (id, name, description, price, icon, category, rarity, effect, detailed_effect, mechanic)
VALUES
  ('art-hp-potion', 'Poción de Vigor Intelectual', 'Brebaje destilado de concentración pura que restaura vitalidad ante retos extenuantes.', 25, 'GlassWater', 'rpg_combat', 'common', '+50 HP Combate', 'Restaura +50 puntos de salud al avatar durante batallas contra Jefes de Materia.', 'heal_50'),
  ('art-runic-shield', 'Escudo Rúnico de Concentración', 'Barrera arcana que desvía ataques de confusión y reduce el impacto de fallos.', 35, 'Shield', 'rpg_combat', 'rare', 'Mitiga 50% Daño', 'Absorbe el 50% del daño del próximo ataque del Jefe escolar y bloquea distracciones.', 'shield_50'),
  ('art-mana-elixir', 'Elixir de Enfoque Crítico', 'Esencia cristalina que agudiza la lógica y potencia los ataques científicos.', 45, 'Wine', 'rpg_combat', 'rare', '+40 Daño Lógico', 'Canaliza razonamiento puro para otorgar +40 de daño bonus en tu siguiente turno contra el Jefe.', 'damage_40'),
  ('art-phoenix-feather', 'Pluma de Fénix Escolar', 'Reliquia milenaria que revive el espíritu del estudiante cuando todo parece perdido.', 85, 'PenTool', 'rpg_combat', 'epic', 'Resurrección 40 HP', 'Si tu salud llega a 0 en una batalla contra el Jefe de Materia, revive inmediatamente con 40 HP.', 'revive_40'),
  ('art-chronos-clock', 'Reloj de Arena de Chronos', 'Ralentiza el fluir del tiempo para analizar problemas con serenidad.', 30, 'Clock', 'academic_challenges', 'common', '+45 Segundos', 'Otorga +45 segundos adicionales en retos con cronómetro y pruebas de lectura comprensiva.', 'extra_time_45'),
  ('art-boots', 'Botas de Agilidad Escolar', 'Calzado encantado que permite esquivar trampas y preguntas capciosas.', 20, 'Footprints', 'academic_challenges', 'common', 'Esquiva Capciosa', 'Permite saltar una pregunta dudosa en un reto sin penalizar el porcentaje final.', 'skip_question'),
  ('art-ai-lens', 'Monóculo del Asistente Pedagógico IA', 'Lente de enfoque pedagógico que analiza el reactivo y resalta el camino correcto.', 40, 'Sparkles', 'academic_challenges', 'rare', 'Pista Inteligente', 'Descarta opciones incorrectas y entrega una pista reflexiva de la Inteligencia Artificial Pedagógica.', 'ai_hint'),
  ('art-exam-retry', 'Cristal de Segunda Oportunidad', 'Gema resplandeciente que concede un nuevo intento sin mácula en el historial.', 60, 'Heart', 'academic_challenges', 'epic', '+1 Reintento Examen', 'Otorga una oportunidad extra para volver a presentar un examen reprobado y subir tu calificación.', 'extra_attempt'),
  ('art-streak-freeze', 'Amuleto de Fuego Fatuo (Racha)', 'Guarda la llama de tu racha intacta ante imprevistos o jornadas de descanso.', 50, 'Gem', 'progression_economy', 'rare', 'Protector de Racha', 'Protege tu racha de días consecutivos si por causa de fuerza mayor o descanso no te conectas un día.', 'streak_freeze'),
  ('art-double-xp-scroll', 'Pergamino del Doble Saber', 'Manuscrito antiguo con fórmulas que multiplican el aprendizaje adquirido.', 75, 'Scroll', 'progression_economy', 'epic', '2x Multiplicador XP', 'Duplica la experiencia obtenida en tu próxima misión o proyecto interactivo del Estudio ISkool.', 'double_xp'),
  ('art-fortune-talisman', 'Talismán de la Fortuna Académica', 'Amuleto áureo que bendice las recompensas de tus próximas faenas escolares.', 65, 'Coins', 'progression_economy', 'rare', '+25% Monedas Extra', 'Genera un 25% más de monedas escolares en tus siguientes 3 misiones o retos completados.', 'coins_boost'),
  ('art-companion-nectar', 'Néctar del Santuario Espiritual', 'Gotas de manantial bendito que revitalizan a tu mascota o compañero espiritual.', 20, 'GlassWater', 'sanctuary_companions', 'common', '100% Vitalidad Mascota', 'Restaura por completo la energía, hambre y felicidad de tu compañero o mascota mágica en el Santuario.', 'companion_restore'),
  ('art-shield', 'Escudo Protector de Promedios', 'Armadura conceptual que resguarda tu calificación ante tropezones académicos.', 40, 'Shield', 'progression_economy', 'rare', 'Respaldo Escolar', 'Evita penalizaciones de créditos y protege tu promedio trimestral ante fallos eventuales.', 'gpa_shield'),
  ('art-scholar-crown', 'Corona del Erudito de Oro', 'Diadema resplandeciente forjada con los cuatro campos formativos de la Nueva Escuela Mexicana.', 150, 'Crown', 'avatar_cosmetics', 'epic', 'Halo Dorado Avatar', 'Corona ceremonial que proyecta un halo místico de oro sobre tu avatar en aulas y cuadros de honor.', 'cosmetic_golden_halo'),
  ('art-astral-aura', 'Aura Astral del Conocimiento', 'Manifestación visual de sabiduría cósmica con anillos orbitales y destellos estelares.', 220, 'Wand2', 'avatar_cosmetics', 'legendary', 'Aura Cósmica Orbital', 'Emanación de constelaciones celestiales y partículas orbitales visibles en tu aula y perfil.', 'cosmetic_astral_aura'),
  ('art-master-cape', 'Manto del Gran Maestro Escolar', 'Capa solemne bordada con hilos de plata y sellos de excelencia institucional.', 250, 'Shirt', 'avatar_cosmetics', 'legendary', 'Capa Ceremonial & Karma', 'Prenda mística de gala bordada con sellos institucionales. Concede distinción en el Cuadro de Honor Escolar.', 'cosmetic_master_cape')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  rarity = EXCLUDED.rarity,
  effect = EXCLUDED.effect,
  detailed_effect = EXCLUDED.detailed_effect,
  mechanic = EXCLUDED.mechanic;
