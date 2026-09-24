/**
 * @file governance_cli.ts
 * @description Interfaz de Línea de Comandos para Gobernanza, Control de Costos y Salud de Producción (Fase 12).
 * Invocado mediante el shim bin/rails.
 */

import { ProductionHealthCheckService } from '../src/lib/observability/healthCheckService';
import { AIGatewayCostLedger } from '../src/lib/aiGateway/costLedger';
import { CurriculumReleaseService } from '../src/lib/curriculumGovernance/releaseService';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'health': {
      console.log(`\n================================================================`);
      console.log(`🛡️  iSchool — Diagnóstico Integral de Producción (Production Readiness)`);
      console.log(`================================================================\n`);

      const report = await ProductionHealthCheckService.runFullCheck();

      console.log(`📅 FECHA: ${report.timestamp}`);
      console.log(`🚦 ESTADO GENERAL: ${report.overall_status}`);
      console.log(`📊 CHEQUEOS TOTALES: ${report.checks_total} (Superados: ${report.checks_passed}, Advertencias: ${report.checks_warning}, Fallos: ${report.checks_failed})\n`);

      console.table(report.checks.map(c => ({
        Categoría: c.category,
        Ítem: c.item_name,
        Estado: c.status.toUpperCase(),
        Detalles: c.details
      })));

      if (report.remediation_steps.length > 0) {
        console.log(`\n🔧 PASOS DE REMEDIACIÓN RECOMENDADOS:`);
        report.remediation_steps.forEach((s, idx) => console.log(`  ${idx + 1}. ${s}`));
      }
      console.log(``);
      break;
    }

    case 'costs': {
      console.log(`\n================================================================`);
      console.log(`💰 iSchool — Libro Mayor de Costos de IA (Cost Ledger & Budgets)`);
      console.log(`================================================================\n`);

      const schoolId = 'sch-jjrosseau';
      const budget = AIGatewayCostLedger.getBudget(schoolId);
      const breakdown = AIGatewayCostLedger.getCostByFeature(schoolId);

      console.log(`🏫 ESCUELA: ${schoolId} | MES: ${budget.billing_month}`);
      console.log(`💵 PRESUPUESTO MENSUAL: $${budget.monthly_budget_usd.toFixed(2)} USD`);
      console.log(`📉 GASTO ACUMULADO:    $${budget.current_spend_usd.toFixed(4)} USD`);
      console.log(`📊 UMBRAL DE ALERTA:   ${budget.alert_threshold_percent}%`);
      console.log(`🚦 ESTADO DE CUOTA:    ${budget.status.toUpperCase()}\n`);

      console.log(`DESGLOSE POR FUNCIONALIDAD PEDAGÓGICA:`);
      console.table(Object.entries(breakdown).map(([feature, data]) => ({
        Módulo: feature,
        'Costo USD': `$${data.cost_usd.toFixed(6)}`,
        Llamadas: data.calls_count
      })));
      console.log(``);
      break;
    }

    case 'release': {
      console.log(`\n================================================================`);
      console.log(`📦 iSchool — Gestor de Entregas Curriculares (Curriculum Releases)`);
      console.log(`================================================================\n`);

      const release = await CurriculumReleaseService.publishRelease({
        release_tag: 'release_1.0_english_2026',
        academic_year: '2026-2027',
        subject: 'English',
        version: '1.0.0',
        description: 'Entrega curricular canónica oficial para Secundaria y Bachillerato (111 Nodos).'
      });

      console.log(`✅ Release publicado con éxito: ${release.release_tag}`);
      console.log(`   Asignatura: ${release.subject} (${release.academic_year})`);
      console.log(`   Versión:    ${release.version}`);
      console.log(`   Nodos Congelados: ${release.approved_node_ids.length}`);
      console.log(`   Publicado:  ${release.published_at}\n`);
      break;
    }

    default: {
      console.log(`\nComandos disponibles para Gobernanza y Producción:`);
      console.log(`  bin/rails iskool:health       # Diagnóstico de disponibilidad productiva`);
      console.log(`  bin/rails ai:costs            # Reporte de gasto en IA y estado de presupuestos`);
      console.log(`  bin/rails curriculum:release  # Congela y publica un Curriculum Release inmutable`);
      console.log(`  bin/rails governance:pilot    # Ejecuta la suite de certificación de Fase 12\n`);
    }
  }
}

main().catch(err => {
  console.error('[governance_cli ERROR]:', err);
  process.exit(1);
});
