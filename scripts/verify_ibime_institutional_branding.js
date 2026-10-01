const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('VERIFICACIÓN FORENSE INSTITUCIONAL - INSTITUTO BILINGÜE IBIME');
console.log('====================================================');

let totalChecks = 0;
let passedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// 1. Activos de Marca
const publicBrandDir = path.join(__dirname, '..', 'public', 'brand');
const logoSvg = path.join(publicBrandDir, 'ibime_logo.svg');
const logoWebp = path.join(publicBrandDir, 'ibime_logo.webp');
const shieldWebp = path.join(publicBrandDir, 'ibime_shield.webp');
const faviconPng = path.join(publicBrandDir, 'ibime_favicon.png');

assert(fs.existsSync(logoSvg), 'ibime_logo.svg existe en public/brand');
assert(fs.existsSync(logoWebp), 'ibime_logo.webp existe en public/brand');
assert(fs.existsSync(shieldWebp), 'ibime_shield.webp existe en public/brand');
assert(fs.existsSync(faviconPng), 'ibime_favicon.png existe en public/brand');

if (fs.existsSync(logoWebp)) {
  const sizeWebp = fs.statSync(logoWebp).size;
  assert(sizeWebp < 300 * 1024, `ibime_logo.webp cumple Regla 3 (<300KB, tamaño real: ${(sizeWebp/1024).toFixed(1)} KB)`);
}
if (fs.existsSync(shieldWebp)) {
  const sizeShield = fs.statSync(shieldWebp).size;
  assert(sizeShield < 300 * 1024, `ibime_shield.webp cumple Regla 3 (<300KB, tamaño real: ${(sizeShield/1024).toFixed(1)} KB)`);
}

// 2. Tokens de Marca en src/lib/branding/tenantThemeTokens.ts
const tokensPath = path.join(__dirname, '..', 'src', 'lib', 'branding', 'tenantThemeTokens.ts');
const tokensContent = fs.readFileSync(tokensPath, 'utf8');
assert(tokensContent.includes('#E41B14'), 'tenantThemeTokens.ts incluye Rojo Escarlata Oficial #E41B14');
assert(tokensContent.includes('#0F2744'), 'tenantThemeTokens.ts incluye Azul Marino Oficial #0F2744');
assert(tokensContent.includes('#C01D0C'), 'tenantThemeTokens.ts incluye Carmesí Facetado #C01D0C');
assert(tokensContent.includes('Instituto Bilingüe Ibime'), 'tenantThemeTokens.ts incluye nombre oficial Instituto Bilingüe Ibime');
assert(tokensContent.includes('https://ibime.edu.mx'), 'tenantThemeTokens.ts incluye URL oficial https://ibime.edu.mx');

// 3. Semillas en src/store/seeds.ts
const seedsPath = path.join(__dirname, '..', 'src', 'store', 'seeds.ts');
const seedsContent = fs.readFileSync(seedsPath, 'utf8');
assert(seedsContent.includes('Instituto Bilingüe Ibime'), 'seeds.ts incluye nombre oficial Instituto Bilingüe Ibime en sch-ibime');
assert(seedsContent.includes('https://ibime.edu.mx'), 'seeds.ts incluye https://ibime.edu.mx en sch-ibime');
assert(seedsContent.includes('2 84% 49%'), 'seeds.ts incluye HSL Rojo Oficial (2 84% 49%)');
assert(seedsContent.includes('213 64% 16%'), 'seeds.ts incluye HSL Azul Marino Oficial (213 64% 16%)');

// 4. Logo Oficial en src/components/brand/IbimeOfficialLogo.tsx
const logoCompPath = path.join(__dirname, '..', 'src', 'components', 'brand', 'IbimeOfficialLogo.tsx');
const logoCompContent = fs.readFileSync(logoCompPath, 'utf8');
assert(logoCompContent.includes('#E41B14'), 'IbimeOfficialLogo.tsx usa #E41B14');
assert(logoCompContent.includes('#C01D0C'), 'IbimeOfficialLogo.tsx usa #C01D0C');
assert(logoCompContent.includes('#0F2744'), 'IbimeOfficialLogo.tsx usa #0F2744');
assert(logoCompContent.includes('ibime.edu.mx'), 'IbimeOfficialLogo.tsx incluye ibime.edu.mx');

// 5. Portal IBIME en src/app/ibime/portal/page.tsx
const portalPath = path.join(__dirname, '..', 'src', 'app', 'ibime', 'portal', 'page.tsx');
const portalContent = fs.readFileSync(portalPath, 'utf8');
assert(portalContent.includes('#E41B14'), 'Portal IBIME usa #E41B14');
assert(portalContent.includes('#0F2744'), 'Portal IBIME usa #0F2744');
assert(portalContent.includes('15PPR3322G'), 'Portal IBIME incluye CCT oficial 15PPR3322G');
assert(portalContent.includes('ibime.edu.mx'), 'Portal IBIME incluye ibime.edu.mx');

// 6. UnifiedLoginView en src/components/auth/UnifiedLoginView.tsx
const loginPath = path.join(__dirname, '..', 'src', 'components', 'auth', 'UnifiedLoginView.tsx');
const loginContent = fs.readFileSync(loginPath, 'utf8');
assert(loginContent.includes('Instituto Bilingüe Ibime'), 'UnifiedLoginView incluye Instituto Bilingüe Ibime');
assert(loginContent.includes('#E41B14'), 'UnifiedLoginView usa #E41B14');
assert(loginContent.includes('#0F2744'), 'UnifiedLoginView usa #0F2744');
assert(loginContent.includes('https://ibime.edu.mx'), 'UnifiedLoginView incluye https://ibime.edu.mx');

// 7. Student HUD en src/app/student/page.tsx y StudentHUD.tsx
const studentPath = path.join(__dirname, '..', 'src', 'app', 'student', 'page.tsx');
const studentContent = fs.readFileSync(studentPath, 'utf8');
assert(studentContent.includes('15PPR3322G'), 'src/app/student/page.tsx incluye CCT 15PPR3322G');
assert(studentContent.includes('#E41B14'), 'src/app/student/page.tsx incluye #E41B14');

// 8. Parent Page en src/app/parent/page.tsx
const parentPath = path.join(__dirname, '..', 'src', 'app', 'parent', 'page.tsx');
const parentContent = fs.readFileSync(parentPath, 'utf8');
assert(parentContent.includes('15PPR3322G'), 'src/app/parent/page.tsx incluye CCT 15PPR3322G');
assert(parentContent.includes('#E41B14'), 'src/app/parent/page.tsx incluye #E41B14');

// 9. PlanningTab en src/app/teacher/PlanningTab.tsx
const planningPath = path.join(__dirname, '..', 'src', 'app', 'teacher', 'PlanningTab.tsx');
const planningContent = fs.readFileSync(planningPath, 'utf8');
assert(planningContent.includes('INSTITUTO BILINGÜE IBIME'), 'PlanningTab incluye membrete INSTITUTO BILINGÜE IBIME');
assert(planningContent.includes('15PPR3322G'), 'PlanningTab incluye CCT 15PPR3322G');
assert(planningContent.includes('https://ibime.edu.mx'), 'PlanningTab incluye https://ibime.edu.mx');

// 10. AttendanceCompendiumModal en src/app/teacher/AttendanceCompendiumModal.tsx
const attendancePath = path.join(__dirname, '..', 'src', 'app', 'teacher', 'AttendanceCompendiumModal.tsx');
const attendanceContent = fs.readFileSync(attendancePath, 'utf8');
assert(attendanceContent.includes('isIbimeGroup'), 'AttendanceCompendiumModal incluye detección isIbimeGroup');
assert(attendanceContent.includes('INSTITUTO BILINGÜE IBIME'), 'AttendanceCompendiumModal incluye INSTITUTO BILINGÜE IBIME');
assert(attendanceContent.includes('15PPR3322G'), 'AttendanceCompendiumModal incluye CCT 15PPR3322G');
assert(attendanceContent.includes('https://ibime.edu.mx'), 'AttendanceCompendiumModal incluye https://ibime.edu.mx');

// 11. Statement Print Page en src/app/parent/financial/statement/print/page.tsx
const statementPrintPath = path.join(__dirname, '..', 'src', 'app', 'parent', 'financial', 'statement', 'print', 'page.tsx');
const statementPrintContent = fs.readFileSync(statementPrintPath, 'utf8');
assert(statementPrintContent.includes('INSTITUTO BILINGÜE IBIME'), 'Estado de cuenta de impresión incluye INSTITUTO BILINGÜE IBIME');
assert(statementPrintContent.includes('15PPR3322G'), 'Estado de cuenta de impresión incluye CCT 15PPR3322G');
assert(statementPrintContent.includes('https://ibime.edu.mx'), 'Estado de cuenta de impresión incluye https://ibime.edu.mx');

// 12. Regla de Aislamiento y Cero Polución
assert(seedsContent.includes('sch-jjrosseau'), 'seeds.ts mantiene configuración intacta para sch-jjrosseau');
assert(seedsContent.includes('UP Juan Jacobo Rosseau'), 'seeds.ts mantiene UP Juan Jacobo Rosseau intacto');
assert(attendanceContent.includes('Colegio Anglo Mexicano'), 'AttendanceCompendiumModal mantiene Colegio Anglo Mexicano para grupos no-IBIME');

console.log('====================================================');
console.log(`RESULTADO FINAL: ${passedChecks}/${totalChecks} verificaciones superadas con éxito.`);
console.log('====================================================');

if (passedChecks === totalChecks) {
  process.exit(0);
} else {
  process.exit(1);
}
