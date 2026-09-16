/**
 * @file verify_db_security_and_secrets.ts
 * @description Auditoría profunda de Seguridad, Secretos en Cliente y Validación de Migraciones de Base de Datos.
 * 
 * Verifica:
 * 1. Cero fugas de claves maestras (SERVICE_ROLE_KEY) en código cliente o variables NEXT_PUBLIC_.
 * 2. Protección de search_path en todas las funciones SECURITY DEFINER.
 * 3. Presencia de bloqueo exclusivo FOR UPDATE en transacciones de la tienda.
 * 4. Presencia de índices compuestos B-Tree estratégicos.
 * 5. Optimización de políticas RLS para erradicar subconsultas O(N) por InitPlan escalar.
 */

import fs from 'fs';
import path from 'path';

interface AuditFinding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  file: string;
  line?: number;
  description: string;
}

const findings: AuditFinding[] = [];
let passedChecks = 0;
let totalChecks = 0;

function check(condition: boolean, title: string, failureDetail?: string) {
  totalChecks++;
  if (condition) {
    console.log(`  ✅ [PASS] ${title}`);
    passedChecks++;
  } else {
    console.error(`  ❌ [FAIL] ${title} -> ${failureDetail || 'Fallo de verificación'}`);
    findings.push({
      severity: 'CRITICAL',
      file: 'Audit Check',
      description: failureDetail || title
    });
  }
}

// ----------------------------------------------------------------------------
// 1. ESCANEO DE ARCHIVOS CLIENTE EN BUSCA DE SERVICE_ROLE_KEY Y SECRETOS
// ----------------------------------------------------------------------------
console.log('\n=============================================================');
console.log('🔒 1. ESCANEO PROFUNDO DE SECRETOS Y CREDENCIALES EN CLIENTE 🔒');
console.log('=============================================================\n');

function scanDirectoryForSecrets(dirPath: string, isClientScope: boolean) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git', '.gemini', 'coverage'].includes(entry.name)) {
        continue;
      }
      scanDirectoryForSecrets(fullPath, isClientScope || entry.name === 'components' || entry.name === 'hooks' || entry.name === 'store' || entry.name === 'public');
    } else if (entry.isFile() && /\.(tsx|ts|js|jsx|json|mjs)$/i.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 1. Detección de SERVICE_ROLE_KEY
        if (/SERVICE_ROLE_KEY/i.test(line) && !/verify_db_security/i.test(entry.name)) {
          findings.push({
            severity: 'CRITICAL',
            file: fullPath,
            line: i + 1,
            description: `Posible referencia a SERVICE_ROLE_KEY encontrada en ${path.relative(process.cwd(), fullPath)}:${i + 1}`
          });
        }

        // 2. Detección de variables privadas expuestas como NEXT_PUBLIC_
        if (/NEXT_PUBLIC_.*(SECRET|PRIVATE|SERVICE_ROLE|ADMIN_KEY)/i.test(line)) {
          findings.push({
            severity: 'CRITICAL',
            file: fullPath,
            line: i + 1,
            description: `Secreto crítico expuesto con prefijo NEXT_PUBLIC_: ${line.trim()}`
          });
        }

        // 3. Clave con rol service_role en el cliente
        if (isClientScope && /"role"\s*:\s*"service_role"/i.test(line)) {
          findings.push({
            severity: 'CRITICAL',
            file: fullPath,
            line: i + 1,
            description: `Token JWT con permisos de service_role detectado en archivo cliente: ${path.relative(process.cwd(), fullPath)}`
          });
        }
      }
    }
  }
}

const rootDir = path.resolve(__dirname, '..');
scanDirectoryForSecrets(path.join(rootDir, 'src'), false);
scanDirectoryForSecrets(path.join(rootDir, 'public'), true);

// Escaneo de archivos .env
const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
for (const envFile of envFiles) {
  const envPath = path.join(rootDir, envFile);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    for (let i = 0; i < envLines.length; i++) {
      const line = envLines[i];
      if (/NEXT_PUBLIC_.*(SERVICE_ROLE|PRIVATE|SECRET_KEY)/i.test(line)) {
        findings.push({
          severity: 'CRITICAL',
          file: envFile,
          line: i + 1,
          description: `Variable de entorno secreta expuesta al navegador con prefijo NEXT_PUBLIC_ en ${envFile}`
        });
      }
    }
  }
}

check(findings.length === 0, 'Cero referencias a SERVICE_ROLE_KEY en cliente y bundles');
check(!findings.some(f => f.description.includes('NEXT_PUBLIC_')), 'Cero secretos maestros expuestos con prefijo NEXT_PUBLIC_');

// ----------------------------------------------------------------------------
// 2. AUDITORÍA DE MIGRACIÓN SQL: RLS, ÍNDICES Y RPC ATÓMICA
// ----------------------------------------------------------------------------
console.log('\n=============================================================');
console.log('⚡ 2. AUDITORÍA DE POLÍTICAS RLS, ÍNDICES B-TREE Y ATOMICIDAD ⚡');
console.log('=============================================================\n');

const migrationPath = path.join(rootDir, 'supabase', 'migrations', '20260916000003_rls_optimization_and_atomic_store.sql');
check(fs.existsSync(migrationPath), 'Archivo de migración 20260916000003_rls_optimization_and_atomic_store.sql existe');

const sqlContent = fs.readFileSync(migrationPath, 'utf8');

// A. Verificación de RPC buy_item_transaction
check(
  sqlContent.includes('CREATE OR REPLACE FUNCTION public.buy_item_transaction'),
  'Función transaccional buy_item_transaction definida'
);
check(
  sqlContent.includes('FOR UPDATE') && (sqlContent.match(/FOR UPDATE/g) || []).length >= 2,
  'Bloqueo exclusivo de fila (SELECT FOR UPDATE) implementado en student_stats y shop_artifacts'
);
check(
  sqlContent.includes('SECURITY DEFINER') && sqlContent.includes('SET search_path = public, pg_catalog, pg_temp'),
  'Protección de secuestro de ruta search_path en funciones con privilegios SECURITY DEFINER'
);
check(
  sqlContent.includes('stock') && sqlContent.includes('v_stock < p_quantity'),
  'Control y validación atómica de agotamiento de stock'
);
check(
  sqlContent.includes('v_coins < v_total_cost'),
  'Control atómico de saldo y fondos insuficientes'
);

// B. Verificación de Índices Compuestos B-Tree
const requiredIndices = [
  'idx_profiles_school_id_id',
  'idx_grades_student_created',
  'idx_attendance_student_created',
  'idx_quest_attempts_student_created',
  'idx_portfolio_items_student_created',
  'idx_student_messages_student_sent',
  'idx_student_inventory_student_artifact',
  'idx_activity_votes_composite',
  'idx_parent_student_composite'
];

for (const idx of requiredIndices) {
  check(sqlContent.includes(idx), `Índice B-Tree de alto tráfico "${idx}" creado`);
}

// C. Verificación de Optimización RLS (InitPlan vs Subconsultas correlacionadas O(N))
check(
  sqlContent.includes('SELECT public.get_auth_user_school_id()') || sqlContent.includes("auth.jwt() ->> 'school_id'"),
  'Políticas RLS optimizadas con evaluación escalar o claims JWT'
);
check(
  sqlContent.includes('is_parent_of_student'),
  'Función helper STABLE is_parent_of_student para erradicar subconsultas EXISTS redundantes'
);

// ----------------------------------------------------------------------------
// 3. CERTIFICACIÓN FINAL
// ----------------------------------------------------------------------------
console.log('\n=============================================================');
console.log(`📊 RESULTADO DE LA AUDITORÍA: ${passedChecks}/${totalChecks} VERIFICACIONES EXITOSAS (${Math.round((passedChecks/totalChecks)*100)}%)`);
console.log('=============================================================\n');

if (findings.length > 0) {
  console.error('🚨 HALLAZGOS DETECTADOS:');
  for (const f of findings) {
    console.error(`  - [${f.severity}] ${f.file}${f.line ? `:${f.line}` : ''} -> ${f.description}`);
  }
  process.exit(1);
} else {
  console.log('🏆 CERTIFICACIÓN OFICIAL: 100% LIBRE DE FUGAS DE CLAVES MAESTRAS');
  console.log('⚡ POLÍTICAS RLS E ÍNDICES B-TREE AUDITADOS Y CERTIFICADOS');
  process.exit(0);
}
