const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { businesses } = require('./generate-sites.cjs');

const imgDir = path.join(__dirname, '..', 'sites', 'assets');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('http')) return resolve(false);
    
    // Request a higher resolution version by appending/replacing parameters
    let hqUrl = url.split('=')[0]; 
    hqUrl += '=s1600'; 
    
    const file = fs.createWriteStream(dest);
    https.get(hqUrl, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => resolve(false));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => resolve(false));
    });
  });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ 
      headless: 'new', 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log(`Starting massive scrape for ${businesses.length} businesses...`);

    for (let i = 0; i < businesses.length; i++) {
      const b = businesses[i];
      const bizDir = path.join(imgDir, b.slug);
      
      const aboutPath = path.join(bizDir, 'about.txt');
      const hasPhotos = fs.existsSync(bizDir) && fs.readdirSync(bizDir).filter(f => f.endsWith('.jpg')).length >= 1;
      const hasAbout = fs.existsSync(aboutPath);

      if (hasPhotos && hasAbout) {
          console.log(`[${i+1}/${businesses.length}] Skipping ${b.name} (Photos & About exist)`);
          continue;
      }

      if (!fs.existsSync(bizDir)) {
          fs.mkdirSync(bizDir, { recursive: true });
      }

      const query = encodeURIComponent(`${b.name}, ${b.town}, Kachchh`);
      const searchUrl = `https://www.google.com/maps/search/${query}`;
      
      console.log(`[${i+1}/${businesses.length}] Searching for ${b.name}...`);
      
      try {
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await delay(3000);

        // Extract any image source that looks like a photo
        const result = await page.evaluate(() => {
          // 1. Get Images
          const sources = Array.from(document.querySelectorAll('img')).map(img => img.src);
          const bgs = Array.from(document.querySelectorAll('div, button, a'))
              .map(el => {
                  const bg = el.style.backgroundImage;
                  if (bg && bg.includes('url')) {
                      const match = bg.match(/url\("?(https:[^"]+)"?\)/);
                      return match ? match[1] : null;
                  }
                  return null;
              })
              .filter(u => !!u);

          const allImgs = [...sources, ...bgs];
          const filteredImgs = Array.from(new Set(allImgs))
              .filter(src => src.includes('googleusercontent.com'))
              .filter(src => !src.includes('streetview'))
              .filter(src => src.length > 50)
              .slice(0, 5);

          // 2. Get Description (About)
          // Look for "From the owner" or editorial summaries
          const selectors = [
            'div.PYvSYb', // "From the owner" content
            'div.fontBodyMedium', // General body text that might contain summary
            'div.we7oDe', // Editorial summary
            'div.w896Jd' // Alternative description container
          ];
          
          let description = '';
          for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.innerText.length > 30) {
              description = el.innerText.trim();
              break;
            }
          }

          return { images: filteredImgs, about: description };
        });

        if (result.images.length > 0) {
          console.log(`   Found ${result.images.length} image sources. Downloading...`);
          for (let j = 0; j < result.images.length; j++) {
              const dest = path.join(bizDir, `photo_${j+1}.jpg`);
              await downloadImage(result.images[j], dest);
          }
        }

        if (result.about) {
          console.log(`   Found description (${result.about.substring(0, 50)}...). Saving...`);
          fs.writeFileSync(path.join(bizDir, 'about.txt'), result.about);
        } else {
          console.log('   No description found.');
        }
      } catch (err) {
        console.error(`   Error scraping ${b.name}:`, err.message);
      }

      await delay(1500);
    }

    await browser.close();
    console.log('Final massive scraping session complete.');
})();
