const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const name = "The Fab Tales";
  const town = "Bhuj";
  const query = encodeURIComponent(`${name}, ${town}, Kachchh`);
  const searchUrl = `https://www.google.com/maps/search/${query}`;
  
  console.log(`Navigating to ${searchUrl}`);
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 5000));
  
  const results = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
    const bgImages = Array.from(document.querySelectorAll('div, a, button'))
        .map(el => el.style.backgroundImage)
        .filter(bg => bg && bg.includes('url'));
    return { images, bgImages };
  });

  console.log('--- FOUND IMAGES ---');
  results.images.forEach(src => {
    if (src.includes('googleusercontent.com')) console.log('IMG:', src.substring(0, 100));
  });
  console.log('--- FOUND BG IMAGES ---');
  results.bgImages.forEach(bg => {
    if (bg.includes('googleusercontent.com')) console.log('BG:', bg.substring(0, 100));
  });

  await browser.close();
})();
