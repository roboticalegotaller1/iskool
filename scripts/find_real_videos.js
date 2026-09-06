const https = require('https');

function checkYoutubeOembed(id) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + id + '&format=json', (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ id, status: res.statusCode, title: json.title, author: json.author_name });
        } catch(e) {
          resolve({ id, status: res.statusCode, error: data });
        }
      });
    }).on('error', e => resolve({ id, error: e.message }));
  });
}

function searchYoutubeHtml(query) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent(query), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-MX,es;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

(async () => {
  const queries = [
    'independencia de mexico para ninos preescolar',
    'cuento de la independencia de mexico preescolar',
    'el grito de dolores para ninos pequenos preescolar',
    'aprende en casa preescolar historia de mexico',
    'cancion independencia de mexico preescolar'
  ];

  for (const q of queries) {
    const html = await searchYoutubeHtml(q);
    const reg = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const ids = [];
    let match;
    while ((match = reg.exec(html)) !== null) {
      if (!ids.includes(match[1])) ids.push(match[1]);
    }
    console.log('Query:', q, 'Found IDs:', ids.length);
    let count = 0;
    for (const id of ids) {
      if (count >= 2) break;
      const res = await checkYoutubeOembed(id);
      if (res.status === 200) {
        console.log(' -> PREESCOLAR 200:', JSON.stringify(res));
        count++;
      }
    }
  }
})();
