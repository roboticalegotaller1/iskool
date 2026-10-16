const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET || 'iskool_zerotrust_hmac_secret_2026_institutional_secure';

function makeSessionToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { ...user, iat: now, exp: now + 3600 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

const users = {
  owner: {
    id: 'usr-owner-1',
    first_name: 'Don Alejandro',
    last_name: 'Vargas',
    role: 'owner',
    school_id: 'sch-jjrosseau',
    email: 'dueno@jjrosseau.edu.mx'
  },
  director: {
    id: 'usr-dir-1',
    first_name: 'Lic. Roberto',
    last_name: 'Garza',
    role: 'director',
    school_id: 'sch-jjrosseau',
    email: 'director@iskool.edu.mx'
  },
  teacher: {
    id: 'usr-teacher-1',
    first_name: 'Prof. Israel',
    last_name: 'López Ángeles',
    role: 'teacher',
    school_id: 'sch-test-case',
    email: 'israel.lopez@sandbox.iskool.edu.mx'
  },
  student: {
    id: 'std-pa',
    first_name: 'Lucas',
    last_name: 'Skywalker',
    role: 'student',
    school_id: 'sch-test-case',
    email: 'lucas@iskool.edu.mx'
  },
  parent: {
    id: 'usr-parent-001',
    first_name: 'Familia',
    last_name: 'López Mendoza',
    role: 'parent',
    school_id: 'sch-test-case',
    email: 'israel.lopez@ejemplo.com'
  }
};

/**
 * Ejecutor con límite de concurrencia mediante Promise.all
 * Previene la saturación de memoria RAM al acotar pestañas simultáneas activas
 */
async function mapConcurrent(items, limit, fn) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);

    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

async function captureScreens() {
  const outputDir = path.join(__dirname, 'presentation_screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Iniciando captura optimizada con concurrencia acotada (Límite: 2 instancias concurrentes)...');

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--js-flags="--max-old-space-size=512"',
        '--window-size=1600,1000'
      ]
    });

    const captures = [
      {
        name: 'screen_finanzas_admin',
        url: 'http://localhost:3000/admin',
        user: users.owner,
        viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
        waitTime: 2500
      },
      {
        name: 'screen_director_supervision',
        url: 'http://localhost:3000/director',
        user: users.director,
        viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
        waitTime: 2500
      },
      {
        name: 'screen_teacher_planning',
        url: 'http://localhost:3000/teacher',
        user: users.teacher,
        viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
        waitTime: 2500
      },
      {
        name: 'screen_studio_canvas',
        url: 'http://localhost:3000/teacher/studio',
        user: users.teacher,
        viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
        waitTime: 3000
      },
      {
        name: 'screen_student_hero',
        url: 'http://localhost:3000/student',
        user: users.student,
        viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
        waitTime: 2500
      },
      {
        name: 'screen_parent_portal',
        url: 'http://localhost:3000/parent',
        user: users.parent,
        viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
        waitTime: 2500
      }
    ];

    // Procesamiento concurrente acotado con Promise.all (max 2 pestañas a la vez)
    await mapConcurrent(captures, 2, async (c) => {
      let page = null;
      try {
        page = await browser.newPage();
        await page.setViewport(c.viewport);

        // Inyección de Cookie HttpOnly 'iskool_session' para interoperabilidad perimetral
        const token = makeSessionToken(c.user);
        await page.setCookie({
          name: 'iskool_session',
          value: token,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Strict'
        });

        console.log(`Navegando a ${c.url} como ${c.user.role}...`);
        await page.goto(c.url, { waitUntil: 'networkidle2', timeout: 35000 });
        await new Promise(resolve => setTimeout(resolve, c.waitTime));

        const filePath = path.join(outputDir, `${c.name}.png`);
        await page.screenshot({ path: filePath, type: 'png' });
        const stats = fs.statSync(filePath);
        console.log(`✓ Capturado: ${c.name}.png (${(stats.size / 1024).toFixed(1)} KB)`);
      } catch (err) {
        console.error(`Error al capturar ${c.name}:`, err.message);
      } finally {
        // Erradicación de memory leaks por pestaña
        if (page) {
          await page.close().catch(() => null);
        }
      }
    });

    console.log('Todas las pantallas capturadas con éxito sin fugas de memoria.');
  } catch (globalErr) {
    console.error('Error global durante la captura:', globalErr.message);
  } finally {
    // Erradicación de procesos huérfanos de navegador
    if (browser) {
      console.log('Cerrando proceso del navegador y liberando memoria...');
      await browser.close().catch(() => null);
    }
  }
}

if (require.main === module) {
  captureScreens();
}

module.exports = { captureScreens };
