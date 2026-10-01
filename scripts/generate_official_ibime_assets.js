const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. SVG del Escudo Oficial Solo (100x100)
const SHIELD_INNER_SVG = `
  <!-- Faceta Izquierda del Escudo (Rojo Escarlata Vivo) -->
  <path d="M50 15 L16 24 C16 40 16 58 26 71 C35.5 82.5 46.5 88 50 89.5 L50 15 Z" fill="#E41B14" />

  <!-- Faceta Derecha del Escudo (Carmesí Sombra Facetada) -->
  <path d="M50 15 L84 24 C84 40 84 58 74 71 C64.5 82.5 53.5 88 50 89.5 L50 15 Z" fill="#C01D0C" />

  <!-- Borde Sutil de Definición -->
  <path d="M50 15 L16 24 C16 40 16 58 26 71 C35.5 82.5 46.5 88 50 89.5 C53.5 88 64.5 82.5 74 71 C84 58 84 40 84 24 Z" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.3" />

  <!-- Emblema Blanco: Cabeza / Sol de la Sabiduría -->
  <circle cx="50" cy="37" r="6" fill="#FFFFFF" />

  <!-- Emblema Blanco: Cuerpo Central (Libro Abierto / Torso) -->
  <!-- Hoja Central Izquierda -->
  <path d="M50 49 L39 42.5 L39 63 C43.5 65.5 47.5 68 50 71 L50 49 Z" fill="#FFFFFF" />
  <!-- Hoja Central Derecha -->
  <path d="M50 49 L61 42.5 L61 63 C56.5 65.5 52.5 68 50 71 L50 49 Z" fill="#FFFFFF" />

  <!-- Columnas / Páginas Fanning Izquierda -->
  <!-- Columna Media Izquierda -->
  <path d="M33.5 45.5 L37 43.5 L37 61.8 C35 60.8 33.5 59.5 33.5 58 Z" fill="#FFFFFF" />
  <!-- Columna Exterior Izquierda -->
  <path d="M28 47.5 L31.5 46 L31.5 60.5 C29.8 59.5 28 58 28 56.5 Z" fill="#FFFFFF" />

  <!-- Columnas / Páginas Fanning Derecha -->
  <!-- Columna Media Derecha -->
  <path d="M66.5 45.5 L63 43.5 L63 61.8 C65 60.8 66.5 59.5 66.5 58 Z" fill="#FFFFFF" />
  <!-- Columna Exterior Derecha -->
  <path d="M72 47.5 L68.5 46 L68.5 60.5 C70.2 59.5 72 58 72 56.5 Z" fill="#FFFFFF" />

  <!-- Hojas Inferiores Abiertas (Líneas de Base Fanning del Libro) -->
  <path d="M50 71 C44 67.5 35 65.5 28 64.8 C34 67 43 69.5 50 73 C57 69.5 66 67 72 64.8 C65 65.5 56 67.5 50 71 Z" fill="#FFFFFF" />
  <path d="M50 73.8 C43 70.8 34.5 69 29.5 67.8 C35.5 70 43.5 72 50 75.5 C56.5 72 64.5 70 70.5 67.8 C65.5 69 57 70.8 50 73.8 Z" fill="#FFFFFF" />
`;

// 2. SVG Completo Horizontal (Para Header y Branding, 320x80)
const FULL_LOGO_SVG = `<svg width="320" height="80" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Escudo Heráldico Bicolor (X: 10, Y: 5, W: 70, H: 70) -->
  <g transform="translate(10, 5) scale(0.7)">
    ${SHIELD_INNER_SVG}
  </g>

  <!-- Tipografía Oficial Institucional -->
  <!-- Instituto Bilingüe -->
  <text x="88" y="27" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#0F2744" letter-spacing="0.8">
    INSTITUTO BILINGÜE
  </text>

  <!-- IBIME Nombre Primario en Rojo Escarlata -->
  <text x="88" y="52" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#E41B14" letter-spacing="-0.5">
    IBIME
  </text>

  <!-- Badge o Subtítulo Institucional -->
  <rect x="175" y="34" width="34" height="18" rx="4" fill="#0F2744" />
  <text x="180" y="47" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="10" fill="#FFFFFF" letter-spacing="0.5">
    S.C.
  </text>

  <!-- Dirección Web Oficial y Planteles -->
  <text x="88" y="68" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="9" fill="#17426D" letter-spacing="0.3">
    ibime.edu.mx · Montes · Lagos · San Cristóbal · Coacalco
  </text>
</svg>`;

// 3. SVG Cuadrado con Fondo Navy Gradient (Matching uploaded reference image 268x268)
const BADGE_LOGO_SVG = `<svg width="268" height="268" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ibimeNavyBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#17426D" />
      <stop offset="50%" stop-color="#214E7C" />
      <stop offset="100%" stop-color="#0F2744" />
    </linearGradient>
  </defs>

  <!-- Fondo Institucional -->
  <rect width="100" height="100" rx="22" fill="url(#ibimeNavyBg)" />

  <!-- Escudo Heráldico Bicolor Central -->
  <g transform="translate(0, 0)">
    ${SHIELD_INNER_SVG}
  </g>
</svg>`;

async function main() {
  const brandDir = path.join(__dirname, '..', 'public', 'brand');
  if (!fs.existsSync(brandDir)) {
    fs.mkdirSync(brandDir, { recursive: true });
  }

  // Guardar SVG oficial
  const svgPath = path.join(brandDir, 'ibime_logo.svg');
  fs.writeFileSync(svgPath, FULL_LOGO_SVG, 'utf8');
  console.log('✅ Guardado:', svgPath);

  // Compilar a WebP comprimido de alta fidelidad (<300KB, Regla 3)
  const webpPath = path.join(brandDir, 'ibime_logo.webp');
  await sharp(Buffer.from(FULL_LOGO_SVG))
    .webp({ quality: 90, lossless: false })
    .toFile(webpPath);
  const webpStats = fs.statSync(webpPath);
  console.log('✅ Compilado WebP:', webpPath, `(${webpStats.size} bytes)`);

  // Compilar escudo badge con fondo azul navy oficial
  const badgeWebpPath = path.join(brandDir, 'ibime_shield.webp');
  await sharp(Buffer.from(BADGE_LOGO_SVG))
    .webp({ quality: 90, lossless: false })
    .toFile(badgeWebpPath);
  const badgeStats = fs.statSync(badgeWebpPath);
  console.log('✅ Compilado Badge WebP:', badgeWebpPath, `(${badgeStats.size} bytes)`);

  // Compilar favicon IBIME
  const faviconSvg = `<svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="24" fill="#0F2744" />
    ${SHIELD_INNER_SVG}
  </svg>`;
  const faviconPath = path.join(brandDir, 'ibime_favicon.ico');
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(brandDir, 'ibime_favicon.png'));
  console.log('✅ Favicon PNG generado');
}

main().catch(err => {
  console.error('Error generando assets:', err);
  process.exit(1);
});
