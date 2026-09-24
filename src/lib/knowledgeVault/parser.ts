/**
 * @file parser.ts
 * @description Parser pedagógico para separar el Frontmatter YAML y el cuerpo Markdown,
 * extrayendo enlaces bidireccionales de Bóveda Curricular [[...]] y calculando el checksum SHA256.
 */

import crypto from 'crypto';
import path from 'path';
import {
  KnowledgeFrontmatter,
  ParsedKnowledgeDocument,
  SchoolStage,
  CefrLevel,
  CambridgeAlignment,
  SkillType,
  DifficultyLevel,
  DocumentStatus
} from './types';

export class KnowledgeVaultParser {
  /**
   * Calcula el checksum criptográfico SHA256 del contenido crudo.
   */
  static computeChecksum(rawContent: string): string {
    return crypto.createHash('sha256').update(rawContent, 'utf8').digest('hex');
  }

  /**
   * Parsea un documento Markdown completo, extrayendo metadatos y cuerpo.
   */
  static parse(rawContent: string, filePath: string = ''): ParsedKnowledgeDocument {
    const trimmed = rawContent.replace(/^\uFEFF/, ''); // Remover BOM si existe
    const checksum = this.computeChecksum(rawContent);
    const wikiLinks = this.extractWikiLinks(rawContent);

    // Separar YAML Frontmatter si existe
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
    const match = trimmed.match(frontmatterRegex);

    let frontmatter: KnowledgeFrontmatter;
    let markdownBody = '';

    const defaultUniqueId = filePath
      ? path.relative(process.cwd(), filePath).replace(/\\/g, '/').replace(/^knowledge\/english\//i, '').replace(/\.md$/i, '').replace(/[\/\s-]/g, '_').toLowerCase()
      : path.basename(filePath, path.extname(filePath)).toLowerCase();

    if (!match) {
      // Documento sin frontmatter o con sintaxis inválida
      frontmatter = {
        id: defaultUniqueId,
        title: path.basename(filePath, path.extname(filePath)),
        type: 'unclassified',
        school_stage: [],
        grades: [],
        cefr: [],
        skills: [],
        source_ids: [],
        status: 'draft',
        version: 1,
        _has_frontmatter: false
      };
      markdownBody = trimmed;
    } else {
      const yamlContent = match[1];
      markdownBody = match[2] || '';
      const parsedYaml = this.parseSimpleYaml(yamlContent);

      frontmatter = {
        id: String(parsedYaml.id || defaultUniqueId),
        title: String(parsedYaml.title || path.basename(filePath, path.extname(filePath))),
        type: String(parsedYaml.type || 'skill_node'),
        school_stage: this.toArray(parsedYaml.school_stage) as SchoolStage[],
        grades: this.toArray(parsedYaml.grades),
        age_band: this.toArray(parsedYaml.age_band),
        cefr: this.toArray(parsedYaml.cefr) as CefrLevel[],
        cambridge_alignment: this.toArray(parsedYaml.cambridge_alignment) as CambridgeAlignment[],
        skills: this.toArray(parsedYaml.skills) as SkillType[],
        subskills: this.toArray(parsedYaml.subskills),
        language_functions: this.toArray(parsedYaml.language_functions),
        grammar: this.toArray(parsedYaml.grammar),
        vocabulary: this.toArray(parsedYaml.vocabulary),
        topics: this.toArray(parsedYaml.topics),
        pedagogy: this.toArray(parsedYaml.pedagogy),
        activity_patterns: this.toArray(parsedYaml.activity_patterns),
        difficulty: parsedYaml.difficulty ? String(parsedYaml.difficulty) as DifficultyLevel : undefined,
        duration_minutes: parsedYaml.duration_minutes ? Number(parsedYaml.duration_minutes) : undefined,
        assessment: this.toArray(parsedYaml.assessment),
        source_ids: this.toArray(parsedYaml.source_ids),
        status: (parsedYaml.status ? String(parsedYaml.status).toLowerCase() : 'draft') as DocumentStatus,
        version: parsedYaml.version ? Number(parsedYaml.version) : 1,
        _has_frontmatter: true,
        ...parsedYaml
      };
    }

    const relativePath = filePath ? path.relative(process.cwd(), filePath).replace(/\\/g, '/') : '';

    return {
      documentId: frontmatter.id,
      filePath,
      relativePath,
      title: frontmatter.title,
      type: frontmatter.type,
      frontmatter,
      rawContent,
      markdownBody: markdownBody.trim(),
      checksum,
      wikiLinks,
      lastModifiedMs: Date.now()
    };
  }

  /**
   * Extrae los enlaces bidireccionales estilo Bóveda Curricular [[Destino]] o [[Destino|Alias]].
   */
  static extractWikiLinks(content: string): string[] {
    const wikiRegex = /\[\[([^[\]|]+)(?:\|[^[\]]+)?\]\]/g;
    const links: string[] = [];
    let m: RegExpExecArray | null;

    while ((m = wikiRegex.exec(content)) !== null) {
      const link = m[1].trim();
      if (link && !links.includes(link)) {
        links.push(link);
      }
    }

    return links;
  }

  /**
   * Normaliza valores a un arreglo plano de strings.
   */
  private static toArray(value: unknown): string[] {
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) return value.map(v => typeof v === 'string' ? v.trim() : String(v));
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return trimmed
          .slice(1, -1)
          .split(',')
          .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
      }
      return [trimmed];
    }
    return [String(value)];
  }

  /**
   * Parser robusto para YAML frontmatter sin requerir librerías C++ nativas.
   * Maneja escalares, listas compactas [a, b], listas anidadas (- item), mapas anidados (ej. grade_progression) y booleanos/enteros.
   */
  private static parseSimpleYaml(yamlStr: string): Record<string, unknown> {
    const rawLines = yamlStr.split(/\r?\n/);
    interface LineInfo {
      indent: number;
      text: string;
    }
    const lines: LineInfo[] = [];
    for (const raw of rawLines) {
      const withoutComment = raw.replace(/#.*$/, '');
      if (!withoutComment.trim()) continue;
      const match = withoutComment.match(/^(\s*)(.*)$/);
      if (!match) continue;
      lines.push({ indent: match[1].length, text: match[2].trimEnd() });
    }

    function parseBlock(startIndex: number, baseIndent: number): { val: unknown; nextIndex: number } {
      if (startIndex >= lines.length) return { val: {}, nextIndex: startIndex };
      const firstLine = lines[startIndex];
      if (firstLine.text.startsWith('- ')) {
        const arr: unknown[] = [];
        let i = startIndex;
        while (i < lines.length && lines[i].indent === baseIndent && lines[i].text.startsWith('- ')) {
          const itemText = lines[i].text.slice(2).trim();
          if (i + 1 < lines.length && lines[i + 1].indent > baseIndent) {
            const sub = parseBlock(i + 1, lines[i + 1].indent);
            arr.push(sub.val);
            i = sub.nextIndex;
          } else {
            arr.push(parseScalar(itemText));
            i++;
          }
        }
        return { val: arr, nextIndex: i };
      } else {
        const obj: Record<string, unknown> = {};
        let i = startIndex;
        while (i < lines.length && lines[i].indent === baseIndent) {
          const line = lines[i];
          const colonIdx = line.text.indexOf(':');
          if (colonIdx === -1) {
            i++;
            continue;
          }
          const key = line.text.slice(0, colonIdx).trim();
          const valuePart = line.text.slice(colonIdx + 1).trim();
          if (!valuePart) {
            if (i + 1 < lines.length && lines[i + 1].indent > baseIndent) {
              const sub = parseBlock(i + 1, lines[i + 1].indent);
              obj[key] = sub.val;
              i = sub.nextIndex;
            } else {
              obj[key] = null;
              i++;
            }
          } else if (valuePart.startsWith('[') && valuePart.endsWith(']')) {
            obj[key] = valuePart
              .slice(1, -1)
              .split(',')
              .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
              .filter(Boolean);
            i++;
          } else {
            obj[key] = parseScalar(valuePart);
            i++;
          }
        }
        return { val: obj, nextIndex: i };
      }
    }

    function parseScalar(valStr: string): unknown {
      const unquoted = valStr.replace(/^['"](.*)['"]$/, '$1');
      if (unquoted === 'true') return true;
      if (unquoted === 'false') return false;
      if (!isNaN(Number(unquoted)) && unquoted !== '') return Number(unquoted);
      return unquoted;
    }

    return (parseBlock(0, lines.length > 0 ? lines[0].indent : 0).val as Record<string, unknown>) || {};
  }
}
