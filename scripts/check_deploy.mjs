async function main() {
  const res = await fetch('https://iskool.mx');
  const text = await res.text();
  const m = text.match(/"buildId":"([^"]+)"/);
  console.log('Deployed buildId:', m ? m[1] : 'not found');
  
  const inboxRes = await fetch('https://iskool.mx/api/mail/raw-inbox?tenantId=e1000000-0000-0000-0000-000000000001&email=roboticalegotaller1@gmail.com');
  const inboxData = await inboxRes.json();
  const prima = inboxData.emails?.find(e => e.subject.toLowerCase().includes('prima'));
  console.log('Prima vacacional badge in raw-inbox API:', prima?.triage_badge);
}

main().catch(console.error);
