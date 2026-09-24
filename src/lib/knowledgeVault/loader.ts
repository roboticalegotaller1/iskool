/**
 * @file loader.ts
 * @description Localizador y cargador recursivo de archivos Markdown de la Bóveda Curricular.
 */

import fs from 'fs';
import path from 'path';
import { KnowledgeVaultParser } from './parser';
import { ParsedKnowledgeDocument } from './types';

export class KnowledgeVaultLoader {
  /**
   * Obtiene la ruta raíz de la Bóveda Curricular según el idioma solicitado.
   */
  static getVaultRootPath(customPath?: string, language: 'english' | 'french' | 'all' = 'english'): string {
    if (customPath && fs.existsSync(customPath)) {
      return customPath;
    }
    if (language === 'french') {
      const envPath = process.env.FRENCH_VAULT_PATH;
      if (envPath && fs.existsSync(envPath)) {
        return envPath;
      }
      return path.join(process.cwd(), 'knowledge', 'french');
    }
    const envPath = process.env.ENGLISH_VAULT_PATH;
    if (envPath && fs.existsSync(envPath)) {
      return envPath;
    }
    return path.join(process.cwd(), 'knowledge', 'english');
  }

  /**
   * Carga y parsea un archivo Markdown individual.
   */
  static loadDocument(filePath: string): ParsedKnowledgeDocument {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo curricular no encontrado: ${filePath}`);
    }
    const rawContent = fs.readFileSync(filePath, 'utf8');
    return KnowledgeVaultParser.parse(rawContent, filePath);
  }

  /**
   * Recorre recursivamente un directorio para encontrar todos los archivos .md.
   */
  static findAllMarkdownFiles(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const files: string[] = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Ignorar directorios ocultos o temporales
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...this.findAllMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private static cachedDocsByLang: Map<string, ParsedKnowledgeDocument[]> = new Map();

  /**
   * Invalida el caché en memoria de la Bóveda Curricular.
   */
  static clearCache(): void {
    this.cachedDocsByLang.clear();
  }

  /**
   * Carga y parsea todos los documentos de la Bóveda Curricular según el idioma.
   * Por defecto, mantiene compatibilidad cargando 'english'.
   */
  static loadAll(vaultPath?: string, language: 'english' | 'french' | 'all' = 'english'): ParsedKnowledgeDocument[] {
    const cacheKey = `${vaultPath || 'default'}_${language}`;
    const cached = this.cachedDocsByLang.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (language === 'all') {
      const engDocs = this.loadAll(undefined, 'english');
      const frDocs = this.loadAll(undefined, 'french');
      const allDocs = [...engDocs, ...frDocs];
      this.cachedDocsByLang.set(cacheKey, allDocs);
      return allDocs;
    }

    const rootPath = this.getVaultRootPath(vaultPath, language);
    const filePaths = this.findAllMarkdownFiles(rootPath);
    const docs = filePaths.map(fp => this.loadDocument(fp));
    this.cachedDocsByLang.set(cacheKey, docs);
    return docs;
  }
}
