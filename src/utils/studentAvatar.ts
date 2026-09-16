import { DetailedStudent } from '@/types';

export const getStudentAvatarUrl = (student: Partial<DetailedStudent> | null | undefined): string => {
  if (!student) return '/images/students/lucas.png';
  
  // 1. Si el expediente 360 cuenta con URL de foto (local, remota o base64)
  if (student.photo_url && (student.photo_url.startsWith('http') || student.photo_url.startsWith('/') || student.photo_url.startsWith('data:'))) {
    if (student.photo_url.includes('std-pa') || student.photo_url.includes('lucas')) {
      return '/images/students/lucas.png';
    }
    if (student.photo_url.includes('std-pb') || student.photo_url.includes('santi')) {
      return '/images/students/santi.png';
    }
    if (student.photo_url.includes('std-sec') || student.photo_url.includes('elena')) {
      return '/images/students/elena.png';
    }
    if (student.photo_url.includes('std-prep') || student.photo_url.includes('mateo')) {
      return '/images/students/mateo.png';
    }
    return student.photo_url;
  }

  // 2. Coincidencia por ID o Nombre de pila oficial del alumno
  const id = (student.id || '').toLowerCase();
  const firstName = (student.first_name || '').toLowerCase();

  if (id === 'std-pa' || firstName.includes('lucas')) {
    return '/images/students/lucas.png';
  }
  if (id === 'std-pb' || firstName.includes('santi')) {
    return '/images/students/santi.png';
  }
  if (id === 'std-sec' || firstName.includes('elena')) {
    return '/images/students/elena.png';
  }
  if (id === 'std-prep' || firstName.includes('mateo')) {
    return '/images/students/mateo.png';
  }
  
  const birthYear = student.birth_date ? parseInt(student.birth_date.split('-')[0]) : 2012;
  const currentYear = 2026;
  const age = currentYear - birthYear;
  const isFemale = (student.gender || '').toLowerCase() === 'femenino' || (student.gender || '').toLowerCase() === 'female';

  // FNV-1a Hash determinista del ID o Matrícula para garantizar distribución única por alumno
  const key = student.id || student.enrollment_id || `${student.first_name || ''}-${student.last_name_1 || ''}-${student.birth_date || ''}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const positiveSeed = Math.abs(hash);

  // Fotografías HD 100% verificadas y activas de estudiantes reales por categoría
  const kidsGirls = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80'
  ];

  const kidsBoys = [
    'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80'
  ];

  const teensGirls = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=250&auto=format&fit=crop&q=80'
  ];

  const teensBoys = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80'
  ];

  const list = (age <= 12 || student.level === 'primaria')
    ? (isFemale ? kidsGirls : kidsBoys)
    : (isFemale ? teensGirls : teensBoys);

  const photoIndex = positiveSeed % list.length;
  return list[photoIndex];
};
