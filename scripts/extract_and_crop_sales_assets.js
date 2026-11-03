const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const pdfPath = 'C:/Users/kami-/.gemini/antigravity/brain/fde3a4d8-54b9-4be2-95e3-e8a0eb4d4f5b/.user_uploaded/media_1793685045286_efdb1637.pdf';
const outDir = path.join(__dirname, '..', 'temp_sales_video_assets', 'pdf_extracted');
const cleanDir = path.join(__dirname, '..', 'temp_sales_video_assets', 'clean_screens');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(cleanDir, { recursive: true });

function unfilterPngRows(data, width, height, bpp) {
  const rowBytes = width * bpp;
  const expectedWithPredictor = (rowBytes + 1) * height;
  if (data.length === rowBytes * height) {
    return data; // No predictor byte per row
  }
  const out = Buffer.alloc(rowBytes * height);
  let inOff = 0;
  let outOff = 0;

  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }

  for (let y = 0; y < height; y++) {
    const filterType = data[inOff++];
    for (let x = 0; x < rowBytes; x++) {
      const raw = data[inOff++] || 0;
      const a = x >= bpp ? out[outOff + x - bpp] : 0;
      const b = y > 0 ? out[outOff - rowBytes + x] : 0;
      const c = (y > 0 && x >= bpp) ? out[outOff - rowBytes + x - bpp] : 0;
      let val = raw;
      if (filterType === 1) val = (raw + a) & 0xff;
      else if (filterType === 2) val = (raw + b) & 0xff;
      else if (filterType === 3) val = (raw + Math.floor((a + b) / 2)) & 0xff;
      else if (filterType === 4) val = (raw + paeth(a, b, c)) & 0xff;
      out[outOff + x] = val;
    }
    outOff += rowBytes;
  }
  return out;
}

const buf = fs.readFileSync(pdfPath);
const str = buf.toString('latin1');

const objRegex = /(\d+)\s+0\s+obj[\s\S]*?endobj/g;
let match;
let imgCount = 0;

while ((match = objRegex.exec(str)) !== null) {
  const objNum = match[1];
  const objText = match[0];
  if (objText.includes('/Subtype /Image') || objText.includes('/Subtype/Image')) {
    const wMatch = objText.match(/\/Width\s+(\d+)/);
    const hMatch = objText.match(/\/Height\s+(\d+)/);
    const filterMatch = objText.match(/\/Filter\s*\/([A-Za-z0-9]+)/);
    const w = wMatch ? parseInt(wMatch[1], 10) : 0;
    const h = hMatch ? parseInt(hMatch[1], 10) : 0;
    const filter = filterMatch ? filterMatch[1] : 'unknown';

    const streamIdx = objText.indexOf('stream');
    const endStreamIdx = objText.lastIndexOf('endstream');
    if (streamIdx !== -1 && endStreamIdx !== -1) {
      let dataStart = match.index + streamIdx + 6;
      if (buf[dataStart] === 13 && buf[dataStart + 1] === 10) dataStart += 2;
      else if (buf[dataStart] === 10 || buf[dataStart] === 13) dataStart += 1;
      let dataEnd = match.index + endStreamIdx;
      while (dataEnd > dataStart && (buf[dataEnd - 1] === 10 || buf[dataEnd - 1] === 13)) dataEnd--;
      const streamBuf = buf.slice(dataStart, dataEnd);
      imgCount++;

      const baseName = `img_${String(imgCount).padStart(2, '0')}.jpg`;
      const outPath = path.join(outDir, baseName);

      if (filter === 'DCTDecode') {
        fs.writeFileSync(outPath, streamBuf);
      } else if (filter === 'FlateDecode') {
        const inflated = zlib.inflateSync(streamBuf);
        const bpp = inflated.length >= (w * 4) * h ? 4 : 3;
        const rawPixels = unfilterPngRows(inflated, w, h, bpp);
        const rawPath = path.join(outDir, `temp_${imgCount}.raw`);
        fs.writeFileSync(rawPath, rawPixels);
        const pixFmt = bpp === 4 ? 'rgba' : 'rgb24';
        execFileSync(ffmpegPath, [
          '-y', '-f', 'rawvideo', '-pix_fmt', pixFmt,
          '-s', `${w}x${h}`, '-i', rawPath,
          '-q:v', '2', outPath
        ], { stdio: 'ignore' });
        fs.unlinkSync(rawPath);
      }

      // Surgically crop top browser URL bar (50px) on images 2..10 which include Chrome's address bar
      const cleanPath = path.join(cleanDir, baseName);
      if (imgCount >= 2 && imgCount <= 10) {
        const cropY = 50;
        const newH = h - cropY;
        execFileSync(ffmpegPath, [
          '-y', '-i', outPath,
          '-vf', `crop=${w}:${newH}:0:${cropY}`,
          '-q:v', '2', cleanPath
        ], { stdio: 'ignore' });
        console.log(`Extracted & Cropped URL bar [${imgCount}]: ${baseName} (${w}x${h} -> ${w}x${newH})`);
      } else {
        fs.copyFileSync(outPath, cleanPath);
        console.log(`Extracted Clean [${imgCount}]: ${baseName} (${w}x${h})`);
      }
    }
  }
}
console.log(`Done! All ${imgCount} clean assets ready in ${cleanDir}`);

