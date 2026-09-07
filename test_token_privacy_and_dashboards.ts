import { isPlatformSuperUser } from './src/types';
import * as fs from 'fs';
import * as path from 'path';

function runTokenPrivacyAudit() {
  console.log('=====================================================');
  console.log('🔍 AUDITORÍA DE PRIVACIDAD DE TOKENS & DASHBOARDS ÚTILES');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
      failed++;
    }
  }

  // 1. Verificación de regla de autorización estricta para Tokens
  const superUsers = [
    { email: 'admin@iskool.edu.mx', role: 'superadmin' },
    { email: 'tecnologia@iskool.edu.mx', role: 'superadmin' },
    { email: 'pedagogia@iskool.edu.mx', role: 'superadmin' }
  ];

  const nonSuperUsers = [
    { email: 'dueno@jjrosseau.edu.mx', role: 'owner' },
    { email: 'director@jjrosseau.edu.mx', role: 'director' },
    { email: 'coordinacion@jjrosseau.edu.mx', role: 'coordinator' },
    { email: 'cobranza@jjrosseau.edu.mx', role: 'billing' },
    { email: 'profesor@jjrosseau.edu.mx', role: 'teacher' },
    { email: 'alumno@jjrosseau.edu.mx', role: 'student' },
    { email: 'familia@jjrosseau.edu.mx', role: 'parent' },
    { email: 'monica.suarez@sandbox.edu.mx', role: 'billing' }
  ];

  console.log('--- 1. Autorización de Métricas de Tokens (Solo 3 Super Usuarios) ---');
  superUsers.forEach(u => {
    assert(isPlatformSuperUser(u), `${u.email} tiene autorización para métricas de tokens`);
  });

  nonSuperUsers.forEach(u => {
    assert(!isPlatformSuperUser(u), `${u.email} (${u.role}) NO tiene autorización para ver tokens`);
  });

  // 2. Verificación de código en admin/page.tsx
  console.log('\n--- 2. Verificación de UI en Dashboard de Dueño / Admin (admin/page.tsx) ---');
  const adminPageContent = fs.readFileSync(path.join(process.cwd(), 'src/app/admin/page.tsx'), 'utf-8');

  // Asegurar que el card de tokens está condicionado por isSuperUser
  assert(
    adminPageContent.includes('{isSuperUser ? (') &&
    adminPageContent.includes('Consumo de Tokens IA (Super Usuario)') &&
    adminPageContent.includes('Cobranza de Colegiaturas'),
    'El card de tokens está condicionado a isSuperUser y los dueños ven "Cobranza de Colegiaturas"'
  );

  // Asegurar que la pestaña de profesores está condicionada
  assert(
    adminPageContent.includes("isSuperUser ? `Profesores & Tokens IA (${schoolTeachers.length})` : `Plantilla Docente (${schoolTeachers.length})`"),
    'La pestaña dice "Plantilla Docente" para usuarios no superusuario'
  );

  // Asegurar que la tabla de profesores no expone tokens a dueños
  assert(
    adminPageContent.includes("{isSuperUser ? 'Tokens IA Usados' : 'Planeaciones Curriculares'}"),
    'Encabezado de tabla muestra "Planeaciones Curriculares" para dueños'
  );
  assert(
    adminPageContent.includes('Bóveda Curricular SEP'),
    'Celdas de tabla muestran "Bóveda Curricular SEP" en lugar de consumo de tokens'
  );

  // 3. Verificación de código en director/page.tsx
  console.log('\n--- 3. Verificación de UI en Dashboard de Director (director/page.tsx) ---');
  const directorPageContent = fs.readFileSync(path.join(process.cwd(), 'src/app/director/page.tsx'), 'utf-8');

  assert(
    !directorPageContent.includes('Tokens consumidos en planeación'),
    'director/page.tsx NO contiene "Tokens consumidos en planeación"'
  );
  assert(
    directorPageContent.includes('Planeación Curricular NEM'),
    'director/page.tsx contiene la métrica útil "Planeación Curricular NEM"'
  );
  assert(
    directorPageContent.includes('Sesiones homologadas Bóveda SEP'),
    'director/page.tsx destaca sesiones homologadas Bóveda SEP'
  );
  assert(
    !directorPageContent.includes('<th className="p-3">Tokens IA</th>'),
    'director/page.tsx eliminó la columna "Tokens IA"'
  );
  assert(
    directorPageContent.includes('Plan(es) NEM'),
    'director/page.tsx muestra planes pedagógicos NEM en lugar de tokens'
  );

  // 4. Verificación de páginas de cobranza y fiscal
  console.log('\n--- 4. Verificación de Coordinación y Pagos ---');
  const billingPageContent = fs.readFileSync(path.join(process.cwd(), 'src/app/coordinator/billing/page.tsx'), 'utf-8');
  assert(
    !billingPageContent.includes('con token firmado'),
    'billing/page.tsx no expone la palabra token en carga de enlace'
  );

  const fiscalPageContent = fs.readFileSync(path.join(process.cwd(), 'src/app/coordinator/fiscal/page.tsx'), 'utf-8');
  assert(
    !fiscalPageContent.includes('Token del PAC'),
    'fiscal/page.tsx reemplazó "Token del PAC" por "Llave de Acceso del PAC"'
  );

  const magicPayContent = fs.readFileSync(path.join(process.cwd(), 'src/app/pay/magic/[token]/page.tsx'), 'utf-8');
  assert(
    !magicPayContent.includes('El token de seguridad proporcionado'),
    'pay/magic no expone "token de seguridad" al usuario final'
  );

  console.log('\n=====================================================');
  console.log(`🎯 RESULTADO AUDITORÍA: ${passed}/${passed + failed} verificaciones superadas.`);
  console.log('=====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTokenPrivacyAudit();
