const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

async function generatePromoVideo() {
  console.log('🚀 Starting Puppeteer Chrome instance...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  console.log('🌐 Navigating to http://localhost:3000/promo ...');
  await page.goto('http://localhost:3000/promo', { waitUntil: 'networkidle0' });

  // Prepare frames directory
  const framesDir = path.join(__dirname, 'temp_frames');
  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(framesDir);

  console.log('📸 Capturing slide sequence frames...');
  const TOTAL_SLIDES = 15; // 15 slides covering all ISkool 2026 modules (Studio, Hero's Journey, Rewards, Vault, Coordinator, Superuser)
  let frameCounter = 0;
  const FPS = 30;

  for (let slideIndex = 0; slideIndex < TOTAL_SLIDES; slideIndex++) {
    console.log(`🎬 Recording Slide ${slideIndex + 1}/${TOTAL_SLIDES}...`);

    // Capture frames for 4 seconds per slide (120 frames per slide @ 30fps)
    const totalFramesForSlide = 4 * FPS;

    for (let f = 0; f < totalFramesForSlide; f++) {
      const frameNumStr = String(frameCounter).padStart(5, '0');
      const framePath = path.join(framesDir, `frame_${frameNumStr}.png`);
      
      await page.screenshot({ path: framePath, type: 'png' });
      frameCounter++;

      // Small delay between screenshots (~25ms)
      await new Promise(res => setTimeout(res, 25));
    }

    if (slideIndex < TOTAL_SLIDES - 1) {
      console.log(`➡️ Advancing to slide ${slideIndex + 2}...`);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextBtn = buttons.find(b => b.textContent && b.textContent.includes('Siguiente'));
        if (nextBtn) {
          nextBtn.click();
        }
      });
      await new Promise(res => setTimeout(res, 600)); // Allow smooth slide transition
    }
  }

  console.log(`\n✅ Total captured frames: ${frameCounter}`);
  await browser.close();

  // STITCH FRAMES WITH FFMPEG INTO HIGH QUALITY MP4
  const outputMp4Path = path.join(__dirname, 'demostracion_iskool_inversionistas.mp4');

  console.log(`🎬 Encoding ${frameCounter} frames to MP4 with FFmpeg...`);
  
  const ffmpegArgs = [
    '-y',
    '-framerate', '30',
    '-i', path.join(framesDir, 'frame_%05d.png'),
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    outputMp4Path
  ];

  const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

  ffmpegProcess.stdout.on('data', data => console.log(`FFmpeg: ${data}`));
  ffmpegProcess.stderr.on('data', data => {
    const msg = data.toString();
    if (msg.includes('frame=')) {
      process.stdout.write(`\r${msg.trim()}`);
    }
  });

  await new Promise((resolve, reject) => {
    ffmpegProcess.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  console.log(`\n🎉 MP4 encoding completed successfully!`);

  // Verify file size
  const stats = fs.statSync(outputMp4Path);
  console.log(`📊 Output MP4 File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

  // Clean up temp frames
  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log('🧹 Cleaned up temporary frame images.');
}

generatePromoVideo().catch(err => {
  console.error('❌ Error generating promo video:', err);
  process.exit(1);
});
