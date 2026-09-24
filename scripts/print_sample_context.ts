import { KnowledgeVaultContextBuilder } from '../src/lib/knowledgeVault';

async function main() {
  const context = await KnowledgeVaultContextBuilder.call({
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'speaking',
    language_function: 'expressing_opinions',
    topic: 'technology'
  });
  console.log(context.toPromptContext());
}

main().catch(console.error);
