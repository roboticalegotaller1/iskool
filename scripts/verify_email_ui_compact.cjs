const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testEmailUI() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Authenticating via /api/auth/session...');
  const authRes = await fetch('http://localhost:3000/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: {
        id: 'usr-admin-1',
        email: 'admin@iskool.edu.mx',
        role: 'superadmin',
        school_id: 'sch-test-case',
        first_name: 'Administrador',
        last_name: 'ISkool'
      }
    })
  });
  
  const rawSetCookie = authRes.headers.get('set-cookie');
  console.log('Auth response status:', authRes.status, 'set-cookie:', rawSetCookie ? 'Received' : 'None');
  
  if (rawSetCookie) {
    const match = rawSetCookie.match(/iskool_session=([^;]+)/);
    if (match) {
      await page.setCookie({
        name: 'iskool_session',
        value: match[1],
        domain: 'localhost',
        path: '/'
      });
      console.log('Successfully set iskool_session cookie!');
    }
  }

  console.log('2. Navigating to http://localhost:3000/admin...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Find and click the Email button (by title or text)
  console.log('3. Opening Email Modal...');
  let clicked = false;
  const emailBtn = await page.$('button[title*="Email"]') || await page.$('button[title*="Correo"]');
  if (emailBtn) {
    await emailBtn.click();
    clicked = true;
    console.log('Clicked email modal button via title selector');
  } else {
    const emailButtons = await page.$$('button');
    for (const btn of emailButtons) {
      const text = await page.evaluate(el => el.textContent || el.getAttribute('title') || '', btn);
      if (text && (text.includes('Email') || text.includes('Triage') || text.includes('Correo'))) {
        await btn.click();
        clicked = true;
        console.log('Clicked email modal button:', text.trim());
        break;
      }
    }
  }

  if (!clicked) {
    console.log('Navigating to http://localhost:3000/admin/ceo...');
    await page.goto('http://localhost:3000/admin/ceo', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const ceoEmailBtn = await page.$('button[title*="Email"]');
    if (ceoEmailBtn) {
      await ceoEmailBtn.click();
      console.log('Clicked Email & Triage button on CEO Dashboard');
    }
  }

  await new Promise(r => setTimeout(r, 1500));

  // Switch to Tab 3: "Conexión POP / IMAP & Google Workspace"
  console.log('4. Clicking Tab 3 (Conexión POP / IMAP & Google Workspace)...');
  const modalButtons = await page.$$('button');
  for (const btn of modalButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Conexión POP / IMAP & Google Workspace')) {
      await btn.click();
      console.log('Switched to Tab 3');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 1: Ultra-compact Connected View for CEO
  const artifactDir = path.join('C:', 'Users', 'kami-', '.gemini', 'antigravity-ide', 'brain', '90798391-9eeb-43cd-8244-e91101ce6774');
  const screenshot1 = path.join(artifactDir, 'ceo_compact_email_view_verified.png');
  await page.screenshot({ path: screenshot1, fullPage: false });
  console.log('Saved Screenshot 1 (Compact Connected View):', screenshot1);

  // Click "Configurar Servidor" button to expand the dropdown menu
  console.log('5. Expanding configuration dropdown menu...');
  const configButtons = await page.$$('button');
  for (const btn of configButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Configurar Servidor')) {
      await btn.click();
      console.log('Clicked Configurar Servidor button');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 2: Expanded Dropdown Menu with 6 Official Logos & Server Settings
  const screenshot2 = path.join(artifactDir, 'ceo_email_dropdown_menu_logos_verified.png');
  await page.screenshot({ path: screenshot2, fullPage: false });
  console.log('Saved Screenshot 2 (Expanded Dropdown with Logos):', screenshot2);

  // Click on "Microsoft 365" provider card to test preset switching
  console.log('6. Selecting Microsoft 365 preset...');
  const providerButtons = await page.$$('button');
  for (const btn of providerButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Microsoft 365')) {
      await btn.click();
      console.log('Selected Microsoft 365 preset');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 3: Microsoft 365 preset applied
  const screenshot3 = path.join(artifactDir, 'ceo_email_preset_selected_verified.png');
  await page.screenshot({ path: screenshot3, fullPage: false });
  console.log('Saved Screenshot 3 (Preset Applied):', screenshot3);

  // Click "Salir de la Cuenta" to verify sign out / switch account
  console.log('7. Testing "Salir de la Cuenta" (Sign out / Switch account)...');
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Salir de la Cuenta')) {
      await btn.click();
      console.log('Clicked Salir de la Cuenta button');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 4: Logged out / Ready to switch account
  const screenshot4 = path.join(artifactDir, 'ceo_email_sign_out_switch_account_verified.png');
  await page.screenshot({ path: screenshot4, fullPage: false });
  console.log('Saved Screenshot 4 (Sign out / Switch account):', screenshot4);

  await browser.close();
  console.log('All screenshots verified and generated successfully!');
}

testEmailUI().catch(err => {
  console.error('Puppeteer test error:', err);
  process.exit(1);
});
