import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('🛡️ SEGURIDAD MULTI-TENANT: Aislamiento Hermético de Base de Datos y RLS (Nivel Bancario)', () => {
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '20261006_hermetic_multi_tenant_emails.sql'
  );

  it('debe existir el archivo de migración SQL 20261006_hermetic_multi_tenant_emails.sql', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

  describe('1. Garantía de Estructura de Tablas y tenant_id UUID NOT NULL', () => {
    const requiredTables = [
      'email_messages',
      'email_issues',
      'email_drafts',
      'tenant_institutions',
      'institutional_memory'
    ];

    requiredTables.forEach((table) => {
      it(`debe definir o asegurar la tabla "${table}" con tenant_id UUID NOT NULL`, () => {
        expect(sqlContent).toContain(table);
        // Verificar que la columna tenant_id esté definida como UUID NOT NULL
        const tableDefinitionOrAlter = sqlContent.includes(`CREATE TABLE IF NOT EXISTS public.${table}`) ||
          sqlContent.includes(`ALTER TABLE public.${table}`);
        expect(tableDefinitionOrAlter).toBe(true);
      });
    });

    it('debe contener columnas tenant_id UUID NOT NULL en todas las entidades requeridas', () => {
      const occurrences = (sqlContent.match(/tenant_id UUID NOT NULL/g) || []).length;
      expect(occurrences).toBeGreaterThanOrEqual(5);
    });
  });

  describe('2. Endurecimiento de Row Level Security (RLS) y FORCE RLS', () => {
    const requiredTables = [
      'email_messages',
      'email_issues',
      'email_drafts',
      'tenant_institutions',
      'institutional_memory'
    ];

    requiredTables.forEach((table) => {
      it(`debe habilitar Row Level Security en la tabla "${table}"`, () => {
        const enableRlsRegex = new RegExp(`ALTER TABLE (public\\.)?${table} ENABLE ROW LEVEL SECURITY;`, 'i');
        expect(enableRlsRegex.test(sqlContent)).toBe(true);
      });

      it(`debe aplicar FORCE ROW LEVEL SECURITY en la tabla "${table}" contra bypass de dueños`, () => {
        const forceRlsRegex = new RegExp(`ALTER TABLE (public\\.)?${table} FORCE ROW LEVEL SECURITY;`, 'i');
        expect(forceRlsRegex.test(sqlContent)).toBe(true);
      });
    });
  });

  describe('3. Verificación de Políticas RLS Infranqueables (JWT app_metadata)', () => {
    it('debe aislar email_messages mediante el claim tenant_id extraído del JWT', () => {
      expect(sqlContent).toContain('CREATE POLICY email_messages_tenant_isolation ON public.email_messages');
      expect(sqlContent).toContain("tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid");
    });

    it('debe aislar email_issues mediante el claim tenant_id extraído del JWT', () => {
      expect(sqlContent).toContain('CREATE POLICY email_issues_tenant_isolation ON public.email_issues');
      expect(sqlContent).toContain("tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid");
    });

    it('debe aislar email_drafts mediante el claim tenant_id extraído del JWT', () => {
      expect(sqlContent).toContain('CREATE POLICY email_drafts_tenant_isolation ON public.email_drafts');
    });

    it('debe aislar institutional_memory mediante el claim tenant_id extraído del JWT', () => {
      expect(sqlContent).toContain('CREATE POLICY institutional_memory_tenant_isolation ON public.institutional_memory');
    });

    it('debe aislar tenant_institutions mediante el claim tenant_id extraído del JWT', () => {
      expect(sqlContent).toContain('CREATE POLICY tenant_institutions_tenant_isolation ON public.tenant_institutions');
    });

    it('debe definir cláusulas restrictivas USING y WITH CHECK simétricas para evitar inserción o lectura no autorizada', () => {
      const usingClauses = (sqlContent.match(/USING \(tenant_id = \(auth\.jwt\(\) -> 'app_metadata' ->> 'tenant_id'\)::uuid\)/g) || []).length;
      const withCheckClauses = (sqlContent.match(/WITH CHECK \(tenant_id = \(auth\.jwt\(\) -> 'app_metadata' ->> 'tenant_id'\)::uuid\)/g) || []).length;

      expect(usingClauses).toBeGreaterThanOrEqual(5);
      expect(withCheckClauses).toBeGreaterThanOrEqual(5);
    });
  });

  describe('4. Rendimiento de Índices B-Tree para Multi-Tenancy', () => {
    it('debe crear índices B-Tree en la columna tenant_id para las 5 tablas', () => {
      expect(sqlContent).toContain('CREATE INDEX IF NOT EXISTS idx_tenant_institutions_tenant_id');
      expect(sqlContent).toContain('CREATE INDEX IF NOT EXISTS idx_email_messages_tenant_id');
      expect(sqlContent).toContain('CREATE INDEX IF NOT EXISTS idx_email_issues_tenant_id');
      expect(sqlContent).toContain('CREATE INDEX IF NOT EXISTS idx_email_drafts_tenant_id');
      expect(sqlContent).toContain('CREATE INDEX IF NOT EXISTS idx_institutional_memory_tenant_id');
    });
  });

  describe('5. Blindaje contra Acceso Anónimo (Zero-Trust)', () => {
    it('debe revocar privilegios a usuarios anónimos en todas las entidades de correo y memoria', () => {
      expect(sqlContent).toContain('REVOKE ALL ON public.email_messages FROM anon;');
      expect(sqlContent).toContain('REVOKE ALL ON public.email_issues FROM anon;');
      expect(sqlContent).toContain('REVOKE ALL ON public.email_drafts FROM anon;');
      expect(sqlContent).toContain('REVOKE ALL ON public.institutional_memory FROM anon;');
      expect(sqlContent).toContain('REVOKE ALL ON public.tenant_institutions FROM anon;');
    });
  });

  describe('6. Cumplimiento de Marca Blanca Institucional (Regla No Negociable 1)', () => {
    it('no debe contener menciones a marcas comerciales externas prohibidas', () => {
      const lowerSql = sqlContent.toLowerCase();
      expect(lowerSql).not.toContain('gemini');
      expect(lowerSql).not.toContain('obsidian');
      expect(lowerSql).not.toContain('canvas lms');
      expect(lowerSql).not.toContain('google classroom');
      expect(lowerSql).not.toContain('blackboard');
    });
  });
});
