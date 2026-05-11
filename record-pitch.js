// record-pitch.js
// Neemt de roadmap-presentatie automatisch op naar een .webm video.
//
// Gebruik:
//   1. zorg dat Node.js geïnstalleerd is (https://nodejs.org)
//   2. open een terminal in deze map
//   3. run:    npm install playwright
//   4. run:    npx playwright install chromium
//   5. run:    node record-pitch.js
//
// Resultaat: een bestand pitch.webm in deze map (~10 MB, 1440x900).
// Converteren naar mp4 (optioneel, vereist ffmpeg):
//   ffmpeg -i pitch.webm -c:v libx264 -crf 20 -preset medium pitch.mp4

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Browser starten...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: __dirname,
      size: { width: 1440, height: 900 }
    },
    deviceScaleFactor: 2 // retina-kwaliteit
  });
  const page = await context.newPage();

  const filePath = 'file://' + path.resolve(__dirname, 'roadmap.html');
  console.log('Roadmap laden:', filePath);
  await page.goto(filePath, { waitUntil: 'networkidle' });

  // 1,5 sec wachten zodat fonts en animaties zijn ingeladen
  await page.waitForTimeout(1500);

  console.log('Presentatie starten...');
  await page.click('.present-btn');

  // tour duurt 90 sec, plus een paar seconden buffer voor de uitloop
  console.log('Opnemen (95 seconden)...');
  await page.waitForTimeout(95000);

  console.log('Opname afronden...');
  await context.close();
  await browser.close();

  // hernoemen van Playwright's gegenereerde bestand naar pitch.webm
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.webm'));
  if (files.length) {
    const generated = path.join(__dirname, files[files.length - 1]);
    const renamed = path.join(__dirname, 'pitch.webm');
    fs.renameSync(generated, renamed);
    console.log('Klaar! Bestand: pitch.webm');
  }
})();
