// Generate icon files for Electron, Web, and Android from user's new logo
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

async function generateIcons() {
  const logoPath = join(ROOT, 'build-resources', 'logo.png');
  const logoBuffer = readFileSync(logoPath);

  console.log('🎨 Generating app icons from new MUGEN logo...\n');

  // --- Windows ICO (16, 32, 48, 64, 128, 256) ---
  const pngSizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  for (const size of pngSizes) {
    const buf = await sharp(logoBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
      .png()
      .toBuffer();
    pngBuffers.push(buf);
    console.log(`  ✅ Generated ${size}x${size} PNG`);
  }

  // Save 256x256 and 512x512 PNG for electron-builder
  const png256 = await sharp(logoBuffer)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toBuffer();
  writeFileSync(join(ROOT, 'build-resources', 'icon.png'), png256);
  writeFileSync(join(ROOT, 'public', 'favicon.png'), png256);
  console.log('  ✅ Saved build-resources/icon.png and public/favicon.png');

  // Generate ICO for Windows App and Web Favicon
  const icoBuffer = await pngToIco(pngBuffers);
  writeFileSync(join(ROOT, 'build-resources', 'icon.ico'), icoBuffer);
  writeFileSync(join(ROOT, 'public', 'favicon.ico'), icoBuffer);
  console.log('  ✅ Saved build-resources/icon.ico and public/favicon.ico');

  // --- Android icons (Capacitor) ---
  const androidSizes = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
  };

  const androidResDir = join(ROOT, 'android', 'app', 'src', 'main', 'res');

  for (const [density, size] of Object.entries(androidSizes)) {
    const dir = join(androidResDir, `mipmap-${density}`);
    if (existsSync(dir)) {
      const buf = await sharp(logoBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
        .png()
        .toBuffer();
      writeFileSync(join(dir, 'ic_launcher.png'), buf);
      writeFileSync(join(dir, 'ic_launcher_round.png'), buf);
      writeFileSync(join(dir, 'ic_launcher_foreground.png'), buf);
      console.log(`  ✅ Android mipmap-${density} (${size}x${size})`);
    }
  }

  // --- Splash screen for Android ---
  const splashDir = join(androidResDir, 'drawable');
  if (existsSync(splashDir)) {
    const splashBuf = await sharp(logoBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
      .png()
      .toBuffer();
    writeFileSync(join(splashDir, 'splash.png'), splashBuf);
    console.log('  ✅ Android splash screen');
  }

  console.log('\n🎉 All icons generated successfully from the new MUGEN logo!');
}

generateIcons().catch(console.error);
