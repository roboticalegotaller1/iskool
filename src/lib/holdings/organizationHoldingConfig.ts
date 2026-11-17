import { CampusData, OrganizationHolding, DetailedStudent, Campus, Institution, isCorporateInstitution } from '@/types';
import {
  getSchoolCampuses,
  getSchoolStudents,
  getSchoolTeachers
} from '@/store/useSchoolAdminStore';

// Holding Oficial en Producción: Instituto Bilingüe IBIME
export const DEFAULT_IBIME_HOLDING: OrganizationHolding = {
  id: 'org-ibime-holding',
  name: 'Instituto Bilingüe IBIME',
  slug: 'ibime',
  tagline: 'Excelencia Bilingüe y Formación Humana desde 2004 · Bachillerato UNAM CCH · 4 Planteles',
  currency: 'MXN',
  targetCollectionRate: 95,
  targetCurriculumCoverage: 90,
  targetRetentionRate: 95,
  campuses: [
    {
      id: 'montes',
      name: 'Campus Montes (Sede Matriz & CCH)',
      location: 'Jardines de Morelos Secc. Montes, Ecatepec',
      students: 0,
      teachers: 0,
      collectionRate: 0,
      admissionsInProgress: 0,
      academicHealth: 0,
      focalIssues: 0,
      curriculumCoverage: 0,
      retentionRate: 0
    },
    {
      id: 'lagos',
      name: 'Campus Lagos (Fundador 2004)',
      location: 'Jardines de Morelos Secc. Lagos, Ecatepec',
      students: 0,
      teachers: 0,
      collectionRate: 0,
      admissionsInProgress: 0,
      academicHealth: 0,
      focalIssues: 0,
      curriculumCoverage: 0,
      retentionRate: 0
    },
    {
      id: 'sancristobal',
      name: 'Campus San Cristóbal (Ecatepec Centro)',
      location: 'Av. Insurgentes, Lomas de Atzolco, Ecatepec',
      students: 0,
      teachers: 0,
      collectionRate: 0,
      admissionsInProgress: 0,
      academicHealth: 0,
      focalIssues: 0,
      curriculumCoverage: 0,
      retentionRate: 0
    },
    {
      id: 'coacalco',
      name: 'Campus Coacalco (Metropolitano)',
      location: 'Col. Guadalupe Victoria, Ecatepec-Coacalco',
      students: 0,
      teachers: 0,
      collectionRate: 0,
      admissionsInProgress: 0,
      academicHealth: 0,
      focalIssues: 0,
      curriculumCoverage: 0,
      retentionRate: 0
    },
  ]
};

/**
 * Generador dinámico de Holding para cualquier institución o empresa dentro de ISkool.
 */
export function buildHoldingForInstitution(
  institution?: Institution | null,
  campusesList?: Campus[],
  detailedStudents?: DetailedStudent[],
  teachersList?: any[]
): OrganizationHolding {
  if (!institution) return DEFAULT_IBIME_HOLDING;

  const isCorp = isCorporateInstitution(institution) ||
                 institution.id?.startsWith('emp-') ||
                 institution.id === 'sec-empresas-ceo' ||
                 (typeof institution.name === 'string' && /bmw|empresa|corporativ|retail|innovasoft/i.test(institution.name));

  const isDemoSchool = institution.id === 'sch-demo-0001';
  const isTestCase = Boolean(
    institution.isTestCase ||
    institution.id === 'sch-test-case' ||
    (typeof institution.name === 'string' && institution.name.toLowerCase().includes('laboratorio'))
  );

  const allCampuses = campusesList || [];
  const schoolCampuses = getSchoolCampuses(allCampuses, institution.id);
  const schoolStudents = getSchoolStudents(detailedStudents || [], institution.id, schoolCampuses);
  const schoolTeachers = getSchoolTeachers(teachersList || [], institution.id, schoolCampuses);

  const demoCollectionRates = [96, 91, 94];
  const demoAdmissionsCounts = [6, 5, 4];
  const demoCurriculumRates = [95, 92, 94];
  const demoRetentionRates = [98, 96, 97];
  const demoFocalCounts = [1, 2, 1];

  const mappedCampuses: CampusData[] = schoolCampuses.length > 0
    ? schoolCampuses.map((c, idx) => {
        const campStudents = schoolStudents.filter(s => s.campus_id === c.id);
        const campTeachers = schoolTeachers.filter(t => t.campus_id === c.id);

        const stCount = campStudents.length > 0
          ? campStudents.length
          : isTestCase
            ? (Math.max(12, Math.floor(schoolStudents.length / schoolCampuses.length)) || 12)
            : (idx === 0 && schoolStudents.every(s => !schoolCampuses.some(sc => sc.id === s.campus_id)) ? schoolStudents.length : 0);

        const tcCount = campTeachers.length > 0
          ? campTeachers.length
          : isTestCase
            ? (Math.max(2, Math.floor(schoolTeachers.length / schoolCampuses.length)) || 2)
            : (idx === 0 && schoolTeachers.every(t => !schoolCampuses.some(sc => sc.id === t.campus_id)) ? schoolTeachers.length : 0);

        const hasActiveOperation = stCount > 0 || tcCount > 0 || isTestCase || isDemoSchool;

        return {
          id: c.id,
          name: c.name,
          location: c.address || `${c.name} · ${isCorp ? 'Planta / Sede Corporativa' : 'Sede Oficial'}`,
          students: stCount,
          teachers: tcCount,
          collectionRate: isDemoSchool
            ? (demoCollectionRates[idx] ?? 93)
            : (stCount > 0 || isTestCase ? Math.max(88, 95 - (idx % 3)) : 0),
          admissionsInProgress: isDemoSchool
            ? (demoAdmissionsCounts[idx] ?? 4)
            : (hasActiveOperation ? Math.floor(8 + idx * 3) : 0),
          academicHealth: isDemoSchool
            ? Math.max(91, 96 - (idx % 3))
            : (hasActiveOperation ? Math.max(90, 96 - (idx % 2)) : 0),
          focalIssues: isDemoSchool
            ? (demoFocalCounts[idx] ?? 1)
            : (isTestCase && idx === 1 ? 1 : 0),
          curriculumCoverage: isDemoSchool
            ? (demoCurriculumRates[idx] ?? 93)
            : (hasActiveOperation ? Math.min(98, 94 + (idx % 3)) : 0),
          retentionRate: isDemoSchool
            ? (demoRetentionRates[idx] ?? 97)
            : (stCount > 0 || isTestCase ? Math.min(98, 96 - (idx % 2)) : 0)
        };
      })
    : [
        {
          id: `${institution.id}-matriz`,
          name: isCorp ? `${institution.name} · Sede Central & Corporativo` : `${institution.name} · Plantel Central`,
          location: institution.address || (isCorp ? 'Sede Corporativa Central' : 'Sede Central'),
          students: schoolStudents.length > 0 ? schoolStudents.length : (isTestCase ? 450 : 0),
          teachers: schoolTeachers.length > 0 ? schoolTeachers.length : (isTestCase ? 28 : 0),
          collectionRate: schoolStudents.length > 0 || isTestCase ? 95 : 0,
          admissionsInProgress: schoolStudents.length > 0 || isTestCase ? 16 : 0,
          academicHealth: schoolStudents.length > 0 || schoolTeachers.length > 0 || isTestCase ? 96 : 0,
          focalIssues: 0,
          curriculumCoverage: schoolStudents.length > 0 || schoolTeachers.length > 0 || isTestCase ? 95 : 0,
          retentionRate: schoolStudents.length > 0 || isTestCase ? 96 : 0
        }
      ];

  return {
    id: `org-${institution.id}-holding`,
    name: institution.name,
    slug: institution.id.replace('sch-', '').replace('emp-', ''),
    tagline: institution.tagline || (isCorp
      ? 'Consorcio corporativo de alta dirección, formación de talento y competencias laborales.'
      : 'Institución de formación integral y excelencia académica.'),
    currency: 'MXN',
    targetCollectionRate: 95,
    targetCurriculumCoverage: 90,
    targetRetentionRate: 95,
    campuses: mappedCampuses
  };
}
