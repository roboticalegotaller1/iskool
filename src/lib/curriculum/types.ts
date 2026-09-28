import { TenantId } from '@/lib/auth/multiTenantSession';

export type { TenantId };

export interface CurriculumSessionMoments {
  inicio: string;
  desarrollo: string;
  cierre: string;
  [key: string]: string;
}

export interface CurriculumSession {
  session_number: number;
  duration_minutes: number;
  moments: CurriculumSessionMoments;
}

export interface CurriculumRubricDescriptor {
  sobresaliente: string;
  satisfactorio: string;
  en_proceso: string;
}

export interface CurriculumRubricCriterion {
  criterion: string;
  weight_percent: number;
  descriptors: CurriculumRubricDescriptor;
}

export interface CurriculumStandard {
  framework: 'NEM 2024' | 'MCCEMS' | 'BICULTURAL_IBIME' | 'CEFR' | string;
  pda_code?: string;
  pda_description: string;
}

export interface BiculturalAdaptation {
  language_target?: 'EN' | 'FR';
  bilingual_scaffolding?: string[];
  transcultural_moment?: string;
  cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
}

export interface CurriculumAuditTrail {
  author_id: string;
  author_name: string;
  author_role: string;
  author_email: string;
  institution_cct?: string;
  tenant_id: TenantId;
  created_at: string;
  updated_at: string;
  signature_sha256: string;
}

export interface CurriculumPlan {
  id: string;
  tenant_id: TenantId;
  namespace?: 'ibime_curriculum_overlays' | 'iskool_canonical_catalog' | string;
  content_hash_sha256?: string;
  parent_plan_id?: string;
  title: string;
  subject_code: string;
  phase?: number;
  grade: number | string;
  curriculum_standard: CurriculumStandard;
  didactic_intent: string;
  sessions: CurriculumSession[];
  evaluation_rubric: CurriculumRubricCriterion[];
  bicultural_adaptations?: BiculturalAdaptation;
  audit_trail: CurriculumAuditTrail;
  vault_node_ref?: string;
  is_custom_overlay: boolean;
}

export interface CreateOrExtendPlanInput {
  id?: string;
  parent_plan_id?: string;
  title: string;
  subject_code: string;
  phase?: number;
  grade: number | string;
  curriculum_standard: CurriculumStandard;
  didactic_intent: string;
  sessions: CurriculumSession[];
  evaluation_rubric: CurriculumRubricCriterion[];
  bicultural_adaptations?: BiculturalAdaptation;
  vault_node_ref?: string;
}

export interface UserAuditContext {
  user_id: string;
  name: string;
  email: string;
  role: string;
  tenant_id: TenantId;
  institution_cct?: string;
}

export interface CurriculumCatalogFilter {
  subject_code?: string;
  grade?: number | string;
  phase?: number;
  framework?: string;
  searchQuery?: string;
}

export interface CurriculumExportPackage {
  format_version: '1.0.0';
  exported_at: string;
  exporter_tenant: TenantId;
  total_plans: number;
  plans: CurriculumPlan[];
  package_checksum: string;
}
