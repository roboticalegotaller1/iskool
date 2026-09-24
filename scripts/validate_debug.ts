import { KnowledgeVaultLoader } from '../src/lib/knowledgeVault/loader';
import { KnowledgeVaultValidator } from '../src/lib/knowledgeVault/validator';

const docs = KnowledgeVaultLoader.loadAll();
const report = KnowledgeVaultValidator.validateBatch(docs);
console.log(`Total docs: ${report.totalFiles}, Valid: ${report.validFiles}, Invalid: ${report.invalidFiles}`);

for (const res of report.results) {
  if (!res.valid) {
    console.log('\nFAIL:', res.filePath);
    for (const err of res.errors) {
      console.log('  field:', err.field);
      console.log('  message:', err.message);
      if (err.value) console.log('  value:', err.value);
    }
  }
}
