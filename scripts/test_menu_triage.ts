import { CognitiveAIEmailTriageService } from '../src/lib/services/geminiEmailTriage.service';

async function testTriage() {
  const result = await CognitiveAIEmailTriageService.evaluateEmail({
    emailId: `test-menu-${Date.now()}`,
    subject: 'Menu infantil',
    bodyText: 'Le solicito me diga el menú infantil de esta semana',
    senderEmail: 'israell35mac@gmail.com',
    senderName: 'israel lopez',
    forceEvaluate: true
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

testTriage().catch(console.error);
