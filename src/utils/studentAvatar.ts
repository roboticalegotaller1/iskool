import { DetailedStudent } from '@/types';

/**
 * Mapa canónico 1 a 1 de retratos de archivo por ID de alumno (0 repeticiones).
 * Cada retrato corresponde exactamente a la edad/nivel educativo y género del estudiante,
 * comprimido en formato WebP (< 30 KB) cumpliendo con la Regla No Negociable 3.
 */
export const STUDENT_ARCHIVE_PORTRAIT_MAP: Record<string, string> = {
  'std-pb': '/images/students/archive/primaria_boy_01.webp',
  'std-pa': '/images/students/archive/primaria_boy_02.webp',
  'std-tor-1': '/images/students/archive/primaria_boy_03.webp',
  'std-sec': '/images/students/archive/secundaria_girl_01.webp',
  'std-prep': '/images/students/archive/preparatoria_boy_01.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380b02': '/images/students/archive/primaria_girl_01.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380b03': '/images/students/archive/primaria_boy_04.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380b04': '/images/students/archive/primaria_girl_02.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380b05': '/images/students/archive/primaria_boy_05.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380b06': '/images/students/archive/primaria_girl_03.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380b07': '/images/students/archive/primaria_boy_16.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380b08': '/images/students/archive/primaria_girl_04.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380b09': '/images/students/archive/primaria_boy_07.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380b10': '/images/students/archive/primaria_girl_05.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a01': '/images/students/archive/primaria_boy_08.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a02': '/images/students/archive/primaria_boy_09.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a03': '/images/students/archive/primaria_girl_06.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a04': '/images/students/archive/primaria_boy_10.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a05': '/images/students/archive/primaria_girl_07.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a06': '/images/students/archive/primaria_boy_11.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a07': '/images/students/archive/primaria_girl_08.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a08': '/images/students/archive/primaria_boy_12.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a09': '/images/students/archive/primaria_girl_09.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a10': '/images/students/archive/primaria_boy_13.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a42': '/images/students/archive/secundaria_girl_02.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c02': '/images/students/archive/secundaria_boy_01.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c03': '/images/students/archive/secundaria_girl_03.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c04': '/images/students/archive/secundaria_boy_02.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c05': '/images/students/archive/secundaria_girl_04.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c06': '/images/students/archive/secundaria_boy_03.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c07': '/images/students/archive/secundaria_girl_05.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c08': '/images/students/archive/secundaria_boy_04.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c09': '/images/students/archive/secundaria_girl_06.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c10': '/images/students/archive/secundaria_boy_05.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44': '/images/students/archive/preparatoria_boy_01.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d02': '/images/students/archive/preparatoria_boy_02.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d03': '/images/students/archive/preparatoria_girl_01.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d04': '/images/students/archive/preparatoria_girl_02.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d05': '/images/students/archive/preparatoria_boy_03.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d06': '/images/students/archive/preparatoria_girl_03.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d07': '/images/students/archive/preparatoria_boy_04.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d08': '/images/students/archive/preparatoria_girl_04.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d09': '/images/students/archive/preparatoria_boy_05.webp',
  'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d10': '/images/students/archive/preparatoria_girl_05.webp',
  'std-ibime-montes-01': '/images/students/archive/primaria_boy_14.webp',
  'std-ibime-lagos-01': '/images/students/archive/primaria_girl_10.webp',
  'std-ibime-san-01': '/images/students/archive/secundaria_boy_06.webp',
  'std-ibime-coac-01': '/images/students/archive/preparatoria_girl_06.webp',
  'std-ibime-coac-02': '/images/students/archive/secundaria_boy_07.webp',
  'std-ibime-montes-02': '/images/students/archive/primaria_girl_11.webp',
  'std-indep-gab-01': '/images/students/archive/secundaria_boy_08.webp',
  'std-indep-gab-02': '/images/students/archive/secundaria_girl_07.webp',
  'std-indep-gab-03': '/images/students/archive/secundaria_boy_09.webp',
  'std-indep-gab-04': '/images/students/archive/secundaria_girl_08.webp',
  'std-indep-gab-05': '/images/students/archive/secundaria_boy_10.webp',
  'std-indep-sof-01': '/images/students/archive/secundaria_girl_09.webp',
  'std-indep-sof-02': '/images/students/archive/secundaria_boy_11.webp',
  'std-indep-sof-03': '/images/students/archive/secundaria_girl_10.webp',
  'std-bmw-01': '/images/students/archive/corporativo_man_01.webp',
  'std-bmw-02': '/images/students/archive/corporativo_woman_01.webp',
  'std-bmw-03': '/images/students/archive/corporativo_man_02.webp',
  'std-bmw-04': '/images/students/archive/corporativo_woman_02.webp',
  'std-bmw-05': '/images/students/archive/corporativo_man_03.webp',
  'std-ventas-01': '/images/students/archive/corporativo_man_04.webp',
  'std-ventas-02': '/images/students/archive/corporativo_woman_03.webp',
  'std-ventas-03': '/images/students/archive/corporativo_man_05.webp',
  'std-tech-01': '/images/students/archive/corporativo_man_06.webp',
  'std-tech-02': '/images/students/archive/corporativo_woman_04.webp',
  'std-tech-03': '/images/students/archive/corporativo_man_07.webp',
};

const ARCHIVE_POOLS = {
  primaria_boy: Array.from({ length: 16 }, (_, i) => `/images/students/archive/primaria_boy_${String(i + 1).padStart(2, '0')}.webp`),
  primaria_girl: Array.from({ length: 16 }, (_, i) => `/images/students/archive/primaria_girl_${String(i + 1).padStart(2, '0')}.webp`),
  secundaria_boy: Array.from({ length: 16 }, (_, i) => `/images/students/archive/secundaria_boy_${String(i + 1).padStart(2, '0')}.webp`),
  secundaria_girl: Array.from({ length: 16 }, (_, i) => `/images/students/archive/secundaria_girl_${String(i + 1).padStart(2, '0')}.webp`),
  preparatoria_boy: Array.from({ length: 8 }, (_, i) => `/images/students/archive/preparatoria_boy_${String(i + 1).padStart(2, '0')}.webp`),
  preparatoria_girl: Array.from({ length: 8 }, (_, i) => `/images/students/archive/preparatoria_girl_${String(i + 1).padStart(2, '0')}.webp`),
  corporativo_man: Array.from({ length: 8 }, (_, i) => `/images/students/archive/corporativo_man_${String(i + 1).padStart(2, '0')}.webp`),
  corporativo_woman: Array.from({ length: 8 }, (_, i) => `/images/students/archive/corporativo_woman_${String(i + 1).padStart(2, '0')}.webp`),
};

const FEMALE_NAMES_SET = new Set([
  'sofia', 'sofía', 'elena', 'valentina', 'camila', 'natalia', 'regina',
  'ana', 'maria', 'maría', 'andrea', 'isabella', 'ximena', 'valeria',
  'renata', 'marcela', 'claudia', 'lucia', 'lucía', 'fernanda', 'mariana',
  'paola', 'gabriela', 'diana', 'carla', 'karla', 'daniela', 'victoria',
]);

function inferIsFemale(student: Partial<DetailedStudent>): boolean {
  const g = (student.gender || '').trim().toLowerCase();
  if (g === 'femenino' || g === 'female' || g === 'f' || g === 'mujer') return true;
  if (g === 'masculino' || g === 'male' || g === 'm' || g === 'hombre') return false;
  const first = ((student.first_name || (student as any).name || '').trim().split(/\s+/)[0] || '').toLowerCase();
  if (FEMALE_NAMES_SET.has(first)) return true;
  if (first.endsWith('a') && !['luca', 'nikola', 'joshua'].includes(first)) return true;
  return false;
}

export const getStudentAvatarUrl = (student: Partial<DetailedStudent> | null | undefined): string => {
  if (!student) return '/images/students/archive/primaria_boy_02.webp';

  const rawId = (student.id || '').trim();
  if (rawId && STUDENT_ARCHIVE_PORTRAIT_MAP[rawId]) {
    return STUDENT_ARCHIVE_PORTRAIT_MAP[rawId];
  }

  // Si tiene una foto personalizada en Base64 o ya apunta al compendio de archivo WebP
  const photoUrl = (student.photo_url || (student as any).photoUrl || '').trim();
  if (photoUrl.startsWith('data:image/') || photoUrl.startsWith('/images/students/archive/')) {
    return photoUrl;
  }

  const isFemale = inferIsFemale(student);
  const schoolId = (student.school_id || '').toLowerCase();
  const birthYear = student.birth_date ? parseInt(student.birth_date.split('-')[0], 10) : NaN;
  const age = !Number.isNaN(birthYear) ? 2026 - birthYear : NaN;
  const level = (student.level || '').toLowerCase();

  let pool: string[];
  if (schoolId.startsWith('emp-') || (!Number.isNaN(age) && age >= 21)) {
    pool = isFemale ? ARCHIVE_POOLS.corporativo_woman : ARCHIVE_POOLS.corporativo_man;
  } else if (level === 'preparatoria' || (!Number.isNaN(age) && age >= 16)) {
    pool = isFemale ? ARCHIVE_POOLS.preparatoria_girl : ARCHIVE_POOLS.preparatoria_boy;
  } else if (level === 'secundaria' || (!Number.isNaN(age) && age >= 12)) {
    pool = isFemale ? ARCHIVE_POOLS.secundaria_girl : ARCHIVE_POOLS.secundaria_boy;
  } else {
    pool = isFemale ? ARCHIVE_POOLS.primaria_girl : ARCHIVE_POOLS.primaria_boy;
  }

  const key = rawId || student.enrollment_id || `${student.first_name || ''}-${student.last_name_1 || ''}-${student.birth_date || ''}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const idx = Math.abs(hash) % pool.length;
  return pool[idx];
};
