#!/usr/bin/env node
/**
 * Optimiza la imagen hero de la Home para LCP.
 * Genera WebP y AVIF en tamaños desktop (1920w) y móvil (768w).
 *
 * Uso: node scripts/optimize-hero.mjs (se ejecuta antes del build)
 *
 * Requiere: sharp
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src', 'assets', 'Bestcars-home.png');
const OUT_DIR = join(ROOT, 'public', 'hero');

const DESKTOP_WIDTH = 1920;
const MOBILE_WIDTH = 768;
const WEBP_QUALITY = 85;
const AVIF_QUALITY = 75;

async function optimize() {
  if (!existsSync(SRC)) {
    console.error('[optimize-hero] No se encontró:', SRC);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  // Eliminar hero-desktop.png si existe (legacy, ahora usamos jpg)
  const legacyPng = join(OUT_DIR, 'hero-desktop.png');
  if (existsSync(legacyPng)) unlinkSync(legacyPng);

  const inputBuffer = readFileSync(SRC);
  const meta = await sharp(inputBuffer).metadata();
  const origSize = (meta.width && meta.height) ? `${meta.width}x${meta.height}` : 'unknown';
  console.log(`[optimize-hero] Origen: ${SRC} (${origSize})`);

  const sizes = [
    { name: 'desktop', width: DESKTOP_WIDTH },
    { name: 'mobile', width: MOBILE_WIDTH },
  ];

  const results = [];

  for (const { name, width } of sizes) {
    const resized = sharp(inputBuffer).resize(width, null, { withoutEnlargement: true });

    // WebP
    const webpPath = join(OUT_DIR, `hero-${name}.webp`);
    const webpBuf = await sharp(inputBuffer)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    writeFileSync(webpPath, webpBuf);
    const webpKb = (webpBuf.length / 1024).toFixed(1);
    results.push({ file: `hero-${name}.webp`, kb: webpKb });

    // AVIF
    const avifPath = join(OUT_DIR, `hero-${name}.avif`);
    const avifBuf = await sharp(inputBuffer)
      .resize(width, null, { withoutEnlargement: true })
      .avif({ quality: AVIF_QUALITY })
      .toBuffer();
    writeFileSync(avifPath, avifBuf);
    const avifKb = (avifBuf.length / 1024).toFixed(1);
    results.push({ file: `hero-${name}.avif`, kb: avifKb });
  }

  // Fallback JPEG (navegadores sin WebP/AVIF, mucho más ligero que PNG)
  const jpgPath = join(OUT_DIR, 'hero-desktop.jpg');
  const jpgBuf = await sharp(inputBuffer)
    .resize(DESKTOP_WIDTH, null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  writeFileSync(jpgPath, jpgBuf);
  const jpgKb = (jpgBuf.length / 1024).toFixed(1);
  results.push({ file: 'hero-desktop.jpg', kb: jpgKb });

  console.log('\n[optimize-hero] Archivos generados:');
  for (const r of results) {
    const kb = parseFloat(r.kb);
    const ok = (r.file.includes('desktop') && !r.file.includes('mobile') && kb < 500) ||
      (r.file.includes('mobile') && kb < 200) ||
      r.file.endsWith('.jpg');
    const status = ok ? '✓' : '⚠';
    console.log(`  ${status} ${r.file}: ${r.kb} KB`);
  }
  console.log('');
}

optimize().catch((err) => {
  console.error('[optimize-hero] Error:', err);
  process.exit(1);
});
