/**
 * @file types.ts
 * @description Contratos de datos para la Gobernanza Curricular y Lanzamientos Inmutables (Ítems #35, #36, #37, #38, #39, #40 y #41).
 */

export type CurriculumNodeStatus = 'draft' | 'review' | 'approved' | 'deprecated' | 'archived';

export interface CurriculumApprovalMetadata {
  created_by: string;
  reviewed_by?: string;
  approved_by?: string;
  approved_at?: string;
  version: string;
}

export interface CurriculumReleaseEntity {
  id: string;
  release_tag: string; // ej: 'release_1.0_english_2026'
  academic_year: string;
  subject: string;
  version: string;
  description: string;
  approved_node_ids: string[];
  node_versions_snapshot: Record<string, string>; // nodeId -> version
  status: 'draft' | 'review' | 'published' | 'deprecated' | 'archived';
  published_by?: string;
  published_at?: string;
  created_at: string;
}
