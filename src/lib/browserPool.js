import puppeteer from 'puppeteer';

let browserInstance = null;
let launchPromise = null;

export async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  // Evita condiciones de carrera si dos llamadas piden el browser al mismo milisegundo
  if (launchPromise) {
    return launchPromise;
  }

  launchPromise = (async () => {
    try {
      browserInstance = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote'
          // Se retira --single-process: en Windows y Node concurrente rompe la conexión CDP
        ],
        timeout: 30000
      });

      browserInstance.on('disconnected', () => {
        browserInstance = null;
        launchPromise = null;
      });

      const cleanUp = async () => {
        if (browserInstance && browserInstance.isConnected()) {
          try {
            await browserInstance.close();
          } catch (_) { }
        }
        browserInstance = null;
        launchPromise = null;
      };

      process.once('SIGINT', cleanUp);
      process.once('SIGTERM', cleanUp);
      process.once('exit', cleanUp);

      return browserInstance;
    } finally {
      launchPromise = null;
    }
  })();

  return launchPromise;
}

export async function renderPdfWithTimeout(url, outputPath, options = {}) {
  const browser = await getBrowser();
  let page = null;

  try {
    page = await browser.newPage();

    // domcontentloaded previene esperas muertas si hay sockets o scripts en segundo plano
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const pdfBuffer = await page.pdf({
      path: outputPath || undefined,
      format: 'A4',
      printBackground: true,
      ...options
    });

    return pdfBuffer;
  } finally {
    // Cierre seguro: solo intenta cerrar si la página existe y no se ha caído la conexión
    if (page && !page.isClosed()) {
      try {
        await page.close();
      } catch (err) {
        // Silencia errores de desconexión CDP en el desmonte para no tumbar el servidor
      }
    }
  }
}