/**
 * @file contextService.ts
 * @description Servicio intermediario que recupera el conocimiento pedagógico oficial desde el Knowledge Vault.
 * Garantiza que únicamente se utilice conocimiento con status: 'approved' y compila la lista de IDs y versiones
 * para asegurar trazabilidad estricta y linaje curricular inalterable.
 */

import { KnowledgeVaultContextBuilder, StructuredAiContext } from '../knowledgeVault/contextBuilder';
import { AcademicGenerationRequest } from './request';
import { KnowledgeDocumentVersion } from './types';

export interface RetrievedAcademicContext {
  context: StructuredAiContext;
  knowledge_document_ids: string[];
  knowledge_versions: KnowledgeDocumentVersion[];
  prompt_context_text: string;
}

export class AcademicGenerationContextService {
  /**
   * Recupera el contexto estructurado a partir de una solicitud académica validada.
   * Por defecto, únicamente utiliza conocimiento con status: 'approved'.
   */
  static async call(request: AcademicGenerationRequest): Promise<RetrievedAcademicContext> {
    const structuredContext = await KnowledgeVaultContextBuilder.call({
      grade: request.grade,
      cefr: request.cefr,
      skill: request.skill,
      topic: request.topic,
      language_function: request.language_function,
      activity_pattern: request.activity_type
    });

    // Extraer documentos consultados y sus versiones
    const consulted = structuredContext.consultedDocuments || [];
    const knowledge_document_ids: string[] = [];
    const knowledge_versions: KnowledgeDocumentVersion[] = [];

    for (const doc of consulted) {
      if (!knowledge_document_ids.includes(doc.document_id)) {
        knowledge_document_ids.push(doc.document_id);
        knowledge_versions.push({
          document_id: doc.document_id,
          version: doc.version,
          checksum: doc.checksum,
          title: doc.title,
          document_type: doc.document_type
        });
      }
    }

    return {
      context: structuredContext,
      knowledge_document_ids,
      knowledge_versions,
      prompt_context_text: structuredContext.toPromptContext()
    };
  }
}
