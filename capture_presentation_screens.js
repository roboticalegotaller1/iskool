const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const users = {
  owner: {
    id: 'usr-owner-1',
    first_name: 'Don Alejandro',
    last_name: 'Vargas',
    role: 'owner',
    email: 'dueno@jjrosseau.edu.mx'
  },
  director: {
    id: 'usr-dir-1',
    first_name: 'Lic. Roberto',
    last_name: 'Garza',
    role: 'director',
    email: 'director@iskool.edu.mx'
  },
  teacher: {
    id: 'usr-teacher-1',
    first_name: 'Prof. Israel',
    last_name: 'López Ángeles',
    role: 'teacher',
    email: 'israel.lopez@jjrosseau.edu.mx'
  },
  student: {
    id: 'std-pa',
    first_name: 'Lucas',
    last_name: 'Skywalker',
    role: 'student',
    email: 'lucas@iskool.edu.mx'
  },
  parent: {
    id: 'usr-parent-001',
    first_name: 'Familia',
    last_name: 'López Mendoza',
    role: 'parent',
    email: 'israel.lopez@ejemplo.com'
  }
};

async function captureScreens() {
  const outputDir = path.join(__dirname, 'presentation_screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Iniciando captura con perfiles autorizados...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
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

  for (const c of captures) {
    try {
      const page = await browser.newPage();
      await page.setViewport(c.viewport);

      await page.evaluateOnNewDocument((userToInject) => {
        localStorage.setItem('iskool_session_user', JSON.stringify(userToInject));
      }, c.user);

      console.log(`Navegando a ${c.url} como ${c.user.role}...`);
      await page.goto(c.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, c.waitTime));

      const filePath = path.join(outputDir, `${c.name}.png`);
      await page.screenshot({ path: filePath, type: 'png' });
      const stats = fs.statSync(filePath);
      console.log(`✓ Capturado: ${c.name}.png (${(stats.size / 1024).toFixed(1)} KB)`);

      await page.close();
    } catch (err) {
      console.error(`Error al capturar ${c.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('Todas las pantallas capturadas con éxito.');
}

captureScreens();
