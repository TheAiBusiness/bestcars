#!/usr/bin/env node
/**
 * Script de auditoría SEO y rendimiento con Lighthouse.
 * Ejecuta Lighthouse en modo headless sobre las URLs de producción.
 *
 * Uso: npm run seo:audit
 *
 * Requiere: lighthouse, chrome-launcher (devDependencies)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://bestcarsiberica.com';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const SCORE_THRESHOLD = 0.9; // 90

// Fallback si el sitemap no está disponible (ej. red restringida)
const FALLBACK_VEHICLE_ID = process.env.LIGHTHOUSE_FALLBACK_VEHICLE_ID || null;

const STATIC_URLS = [
  `${BASE_URL}/`,
  `${BASE_URL}/garage`,
  `${BASE_URL}/experiencia`,
];

/**
 * Obtiene el primer ID de vehículo del sitemap.xml
 */
async function getVehicleIdFromSitemap() {
  try {
    const res = await fetch(SITEMAP_URL);
    const xml = await res.text();
    const match = xml.match(/<loc>https:\/\/bestcarsiberica\.com\/vehicle\/([^<]+)<\/loc>/);
    return match ? match[1] : null;
  } catch (err) {
    console.warn('[lighthouse-audit] No se pudo obtener sitemap:', err.message);
    return FALLBACK_VEHICLE_ID;
  }
}

/**
 * Ejecuta Lighthouse sobre una URL
 */
async function runLighthouse(url) {
  const { launch } = await import('chrome-launcher');
  const { default: lighthouse } = await import('lighthouse');

  const launchOpts = {
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
  };
  if (process.env.CHROME_PATH) launchOpts.chromePath = process.env.CHROME_PATH;
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.chromePath = process.env.PUPPETEER_EXECUTABLE_PATH;

  const chrome = await launch(launchOpts);

  try {
    const options = {
      logLevel: 'error',
      output: 'json',
      port: chrome.port,
      formFactor: 'desktop',
      screenEmulation: { disabled: true },
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
      },
    };

    const runnerResult = await lighthouse(url, options, null);
    return runnerResult.lhr;
  } finally {
    if (chrome?.kill) chrome.kill();
  }
}

/**
 * Extrae puntuaciones de las categorías
 */
function extractScores(lhr) {
  const categories = lhr.categories || {};
  return {
    performance: Math.round((categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
    'best-practices': Math.round((categories['best-practices']?.score ?? 0) * 100),
    seo: Math.round((categories.seo?.score ?? 0) * 100),
  };
}

/**
 * Extrae recomendaciones de Lighthouse para categorías con score < 90
 */
function extractRecommendations(lhr, scores) {
  const recommendations = [];
  const categories = lhr.categories || {};
  const audits = lhr.audits || {};

  for (const [catId, score] of Object.entries(scores)) {
    if (score >= 90) continue;

    const category = categories[catId];
    if (!category?.auditRefs) continue;

    for (const ref of category.auditRefs) {
      const audit = audits[ref.id];
      if (!audit) continue;

      const auditScore = audit.score;
      if (auditScore === null) continue;
      if (auditScore >= SCORE_THRESHOLD) continue;

      const displayValue = audit.displayValue ? ` (${audit.displayValue})` : '';
      recommendations.push({
        category: catId,
        title: audit.title,
        description: audit.description?.replace(/\s+/g, ' ').slice(0, 200) || '',
        displayValue: audit.displayValue || null,
        score: auditScore !== null ? Math.round(auditScore * 100) : null,
      });
    }
  }

  return recommendations;
}

/**
 * Imprime tabla en consola
 */
function printTable(results) {
  const headers = ['URL', 'Perf', 'A11y', 'BP', 'SEO'];
  const colWidths = [50, 6, 6, 6, 6];
  const sep = colWidths.map((w) => '-'.repeat(w)).join('-+-');

  console.log('\n' + sep);
  console.log(headers.map((h, i) => h.padEnd(colWidths[i])).join(' | '));
  console.log(sep);

  for (const r of results) {
    const urlShort = r.url.length > 47 ? r.url.slice(0, 44) + '...' : r.url;
    const row = [
      urlShort,
      String(r.scores.performance).padStart(4),
      String(r.scores.accessibility).padStart(4),
      String(r.scores['best-practices']).padStart(4),
      String(r.scores.seo).padStart(4),
    ];
    console.log(row.map((c, i) => c.padEnd(colWidths[i])).join(' | '));
  }
  console.log(sep);

  const avg = {
    performance: Math.round(results.reduce((a, r) => a + r.scores.performance, 0) / results.length),
    accessibility: Math.round(results.reduce((a, r) => a + r.scores.accessibility, 0) / results.length),
    'best-practices': Math.round(results.reduce((a, r) => a + r.scores['best-practices'], 0) / results.length),
    seo: Math.round(results.reduce((a, r) => a + r.scores.seo, 0) / results.length),
  };
  console.log('MEDIA'.padEnd(colWidths[0]) + ' | ' + [avg.performance, avg.accessibility, avg['best-practices'], avg.seo].map((n) => String(n).padStart(4)).join(' | '));
  console.log(sep + '\n');
}

/**
 * Imprime recomendaciones
 */
function printRecommendations(results) {
  const allRecs = results.flatMap((r) => r.recommendations.map((rec) => ({ ...rec, url: r.url })));
  if (allRecs.length === 0) return;

  console.log('\n--- RECOMENDACIONES (métricas < 90) ---\n');
  for (const rec of allRecs) {
    console.log(`[${rec.category.toUpperCase()}] ${rec.title}${rec.displayValue ? ` — ${rec.displayValue}` : ''}`);
    console.log(`  URL: ${rec.url}`);
    if (rec.description) console.log(`  ${rec.description.slice(0, 150)}...`);
    console.log('');
  }
}

async function main() {
  console.log('Lighthouse Audit — BestCars Ibérica');
  console.log('====================================\n');

  const urls = [...STATIC_URLS];

  const vehicleId = await getVehicleIdFromSitemap();
  if (vehicleId) {
    urls.push(`${BASE_URL}/vehicle/${vehicleId}`);
    console.log(`Vehículo detectado en sitemap: /vehicle/${vehicleId}\n`);
  } else {
    console.log('No se encontró vehículo en sitemap. Auditando solo URLs estáticas.\n');
  }

  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] Auditando: ${url}`);
    try {
      const lhr = await runLighthouse(url);
      const scores = extractScores(lhr);
      const recommendations = extractRecommendations(lhr, scores);

      results.push({
        url,
        scores,
        recommendations,
        fetchedAt: new Date().toISOString(),
      });
    } catch (err) {
      const msg = err.message || String(err);
      console.error(`  Error: ${msg}`);
      if (msg.includes('Chrome') || msg.includes('chromium')) {
        console.error('\n  → Instala Chrome o Chromium, o define CHROME_PATH / PUPPETEER_EXECUTABLE_PATH');
      }
      results.push({
        url,
        error: err.message,
        scores: { performance: 0, accessibility: 0, 'best-practices': 0, seo: 0 },
        recommendations: [],
      });
    }
  }

  printTable(results);
  printRecommendations(results);

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    results,
  };

  const outDir = join(__dirname, '..', 'reports');
  mkdirSync(outDir, { recursive: true });
  const reportPath = join(outDir, `lighthouse-audit-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Informe JSON guardado: ${reportPath}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
