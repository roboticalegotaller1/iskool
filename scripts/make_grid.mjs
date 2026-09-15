import sharp from 'sharp';

async function makeGrid() {
  let gridLines = '';
  for (let x = 320; x <= 450; x += 5) {
    const isMajor = x % 10 === 0;
    gridLines += `<line x1="${x}" y1="175" x2="${x}" y2="230" stroke="${isMajor ? 'red' : 'pink'}" stroke-width="${isMajor ? 0.8 : 0.4}" opacity="0.7"/>`;
    if (isMajor) gridLines += `<text x="${x}" y="181" font-size="5" fill="red" text-anchor="middle">${x}</text>`;
  }
  for (let y = 175; y <= 230; y += 5) {
    const isMajor = y % 10 === 0;
    gridLines += `<line x1="320" y1="${y}" x2="450" y2="${y}" stroke="${isMajor ? 'blue' : 'cyan'}" stroke-width="${isMajor ? 0.8 : 0.4}" opacity="0.7"/>`;
    if (isMajor) gridLines += `<text x="323" y="${y + 2}" font-size="5" fill="blue">${y}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="130" height="55" viewBox="320 175 130 55">${gridLines}</svg>`;

  await sharp('female_eyes_crop.png')
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile('female_eyes_grid.png');

  console.log('Saved female_eyes_grid.png');
}

makeGrid();
