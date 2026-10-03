const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, 'assets');

async function optimize() {
  const files = fs.readdirSync(assetsDir);
  console.log('Optimizing images in assets directory...');

  let originalTotal = 0;
  let optimizedTotal = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);

    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      originalTotal += stats.size;
      const baseName = path.basename(file, ext);
      const webpPath = path.join(assetsDir, `${baseName}.webp`);

      // Convert to WebP
      if (ext === '.png') {
        await sharp(filePath)
          .webp({ quality: 88, effort: 6, alphaQuality: 90 })
          .toFile(webpPath);
      } else {
        await sharp(filePath)
          .webp({ quality: 84, effort: 6 })
          .toFile(webpPath);
      }

      const webpStats = fs.statSync(webpPath);
      optimizedTotal += webpStats.size;
      const savings = (((stats.size - webpStats.size) / stats.size) * 100).toFixed(1);
      console.log(`✓ ${file} (${(stats.size / 1024).toFixed(1)} KB) -> ${baseName}.webp (${(webpStats.size / 1024).toFixed(1)} KB) [${savings}% saved]`);
    }
  }

  console.log('----------------------------------------------------');
  console.log(`Total Original: ${(originalTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total WebP:     ${(optimizedTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Overall Savings: ${(((originalTotal - optimizedTotal) / originalTotal) * 100).toFixed(1)}%`);
}

optimize().catch(console.error);
