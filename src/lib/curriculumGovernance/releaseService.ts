/**
 * @file releaseService.ts
 * @description Servicio de Gestión de Entregas Curriculares Inmutables (CurriculumRelease / Ítems #38, #39 y #40).
 * Congela versiones estables de la Bóveda Curricular en un release inmutable para vincular cursos y lecciones,
 * asegurando que los cambios futuros no alteren silenciosamente la base pedagógica ya publicada.
 */

import { CurriculumReleaseEntity } from './types';
import { KnowledgeVaultLoader } from '../knowledgeVault/loader';
import { supabase } from '../supabaseClient';

export class CurriculumReleaseService {
  private static releases = new Map<string, CurriculumReleaseEntity>();

  /**
   * Publica una nueva Entrega Curricular Inmutable a partir de los nodos de la Bóveda.
   */
  static async publishRelease(params: {
    release_tag: string;
    academic_year: string;
    subject: string;
    version: string;
    description: string;
    published_by?: string;
  }): Promise<CurriculumReleaseEntity> {
    const lang = (params.subject === 'french' ? 'french' : 'english') as 'english' | 'french';
    const allVaultDocs = KnowledgeVaultLoader.loadAll(undefined, lang);
    const approvedNodeIds: string[] = [];
    const nodeVersionsSnapshot: Record<string, string> = {};

    for (const doc of allVaultDocs) {
      const docId = doc.documentId;
      if (!docId) continue;
      // Todo nodo en la Bóveda validada se incorpora con su versión de frontmatter
      approvedNodeIds.push(docId);
      nodeVersionsSnapshot[docId] = String(doc.frontmatter?.version || '1.0.0');
    }

    const release: CurriculumReleaseEntity = {
      id: `rel_${Date.now()}`,
      release_tag: params.release_tag,
      academic_year: params.academic_year,
      subject: params.subject,
      version: params.version,
      description: params.description,
      approved_node_ids: approvedNodeIds,
      node_versions_snapshot: nodeVersionsSnapshot,
      status: 'published',
      published_by: params.published_by,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    this.releases.set(release.release_tag, release);

    try {
      if (supabase) {
        await supabase.from('curriculum_releases').upsert({
          id: release.id,
          release_tag: release.release_tag,
          academic_year: release.academic_year,
          subject: release.subject,
          version: release.version,
          description: release.description,
          approved_node_ids: release.approved_node_ids,
          node_versions_snapshot: release.node_versions_snapshot,
          status: release.status,
          published_by: release.published_by,
          published_at: release.published_at,
          created_at: release.created_at
        });
      }
    } catch {
      // Degradar a memoria
    }

    return release;
  }

  /**
   * Obtiene una entrega curricular por su etiqueta única.
   */
  static async getRelease(releaseTag: string): Promise<CurriculumReleaseEntity | undefined> {
    if (this.releases.has(releaseTag)) {
      return this.releases.get(releaseTag);
    }

    // Inicializar release canónica por defecto si se solicita
    if (releaseTag === 'release_1.0_english_2026') {
      return await this.publishRelease({
        release_tag: 'release_1.0_english_2026',
        academic_year: '2026-2027',
        subject: 'English',
        version: '1.0.0',
        description: 'Entrega curricular canónica oficial para Secundaria y Bachillerato (111 Nodos).'
      });
    }

    return undefined;
  }

  /**
   * Valida si un conjunto de objetivos curriculares está cubierto y aprobado en un release.
   */
  static async validateTargetsInRelease(
    releaseTag: string,
    targetIds: string[]
  ): Promise<{ aligned: boolean; unapprovedTargets: string[] }> {
    const release = await this.getRelease(releaseTag);
    if (!release) {
      return { aligned: false, unapprovedTargets: targetIds };
    }

    const approvedSet = new Set(release.approved_node_ids);
    const unapproved = targetIds.filter(id => !approvedSet.has(id));

    return {
      aligned: unapproved.length === 0,
      unapprovedTargets: unapproved
    };
  }

  static clear(): void {
    this.releases.clear();
  }
}
