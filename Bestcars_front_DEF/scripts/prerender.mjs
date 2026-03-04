#!/usr/bin/env node
/**
 * Script de prerender post-build para SEO.
 * Prerenderiza páginas estáticas + fichas de vehículos dinámicas.
 *
 * Ejecutar después de: npm run build
 * Requiere: puppeteer, API backend accesible (VITE_API_URL)
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PORT = 37542;

const STATIC_ROUTES = ['/', '/garage', '/experiencia', '/terminos', '/privacidad'];
const RENDER_WAIT_MS = 5000;
const PAGE_TIMEOUT_MS = 10000;
const CONCURRENCY = 4;
const API_FETCH_TIMEOUT_MS = 8000;

const API_BASE = (process.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

/**
 * Obtiene IDs de vehículos activos desde sitemap.xml o /api/vehicles
 */
async function fetchVehicleIds() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_FETCH_TIMEOUT_MS);

  try {
    // Intentar sitemap primero (misma fuente que Google)
    const sitemapUrl = `${API_BASE}/sitemap.xml`;
    const res = await fetch(sitemapUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();
    const ids = [...xml.matchAll(/\/vehicle\/([a-zA-Z0-9_-]+)/g)].map((m) => m[1]);
    return [...new Set(ids)];
  } catch {
    clearTimeout(timeout);
  }

  // Fallback: /api/vehicles
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), API_FETCH_TIMEOUT_MS);
    const res = await fetch(`${API_BASE}/api/vehicles`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list.map((v) => v.id).filter(Boolean);
  } catch {
    return [];
  }
}

async function serveDist() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
      cwd: ROOT,
      stdio: 'ignore',
      shell: true,
    });
    proc.on('error', reject);
    const start = Date.now();
    const check = () => {
      fetch(`http://localhost:${PORT}`)
        .then(() => resolve(proc))
        .catch(() => {
          if (Date.now() - start < 12000) setTimeout(check, 200);
          else resolve(proc);
        });
    };
    setTimeout(check, 500);
  });
}

/**
 * Procesa vehículos en chunks con N páginas en paralelo.
 * Cada chunk usa una página distinta; al terminar, siguiente chunk.
 */
async function prerenderVehiclesInBatches(browser, base, vehicleIds, concurrency) {
  const pages = await Promise.all(
    Array.from({ length: concurrency }, () => browser.newPage())
  );
  await Promise.all(pages.map((p) => p.setViewport({ width: 1280, height: 720 })));

  const total = vehicleIds.length;
  let done = 0;

  for (let i = 0; i < vehicleIds.length; i += concurrency) {
    const chunk = vehicleIds.slice(i, i + concurrency);
    await Promise.all(
      chunk.map((id, j) => {
        const page = pages[j];
        const route = `/vehicle/${id}`;
        const outPath = join(DIST, 'vehicle', id, 'index.html');
        return (async () => {
          try {
            await page.goto(base + route, {
              waitUntil: 'networkidle0',
              timeout: PAGE_TIMEOUT_MS,
            });
            await page
              .waitForFunction(
                () => document.querySelector('#root')?.innerHTML?.length > 100,
                { timeout: PAGE_TIMEOUT_MS - 2000 }
              )
              .catch(() => {});
            await new Promise((r) => setTimeout(r, RENDER_WAIT_MS));
            const html = await page.content();
            mkdirSync(dirname(outPath), { recursive: true });
            writeFileSync(outPath, html);
          } catch (err) {
            console.error(`[prerender] Error en /vehicle/${id}:`, err.message);
          }
          done++;
          console.log(`[prerender] Vehículo ${done}/${total}: ${id}`);
        })();
      })
    );
  }

  await Promise.all(pages.map((p) => p.close()));
}

/**
 * Elimina directorios de vehículos que ya no están en la lista
 */
function cleanupRemovedVehicles(validIds) {
  const vehicleDir = join(DIST, 'vehicle');
  if (!existsSync(vehicleDir)) return;

  const dirs = readdirSync(vehicleDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const id of dirs) {
    if (!validIds.includes(id)) {
      const path = join(vehicleDir, id);
      rmSync(path, { recursive: true });
      console.log(`[prerender] Eliminado (ya no en stock): vehicle/${id}`);
    }
  }
}

async function prerender() {
  console.log('[prerender] Obteniendo IDs de vehículos...');
  let vehicleIds = [];
  try {
    vehicleIds = await fetchVehicleIds();
    console.log(`[prerender] ${vehicleIds.length} vehículos activos encontrados`);
  } catch (err) {
    console.warn('[prerender] API no disponible:', err.message);
    console.warn('[prerender] Prerenderizando solo páginas estáticas.');
  }

  const puppeteer = await import('puppeteer');
  const serverProc = await serveDist();
  const base = `http://localhost:${PORT}`;

  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // 1. Páginas estáticas
  console.log('[prerender] Páginas estáticas...');
  for (const route of STATIC_ROUTES) {
    try {
      await page.goto(base + route, {
        waitUntil: 'networkidle0',
        timeout: PAGE_TIMEOUT_MS,
      });
      await page
        .waitForFunction(
          () => document.querySelector('#root')?.innerHTML?.length > 50,
          { timeout: 8000 }
        )
        .catch(() => {});
      await new Promise((r) => setTimeout(r, RENDER_WAIT_MS));
      const html = await page.content();
      const outPath =
        route === '/' ? join(DIST, 'index.html') : join(DIST, route.slice(1), 'index.html');
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html);
      console.log(`[prerender] ${route} -> ${outPath}`);
    } catch (err) {
      console.error(`[prerender] Error en ${route}:`, err.message);
    }
  }

  // 2. Fichas de vehículos (con concurrencia)
  if (vehicleIds.length > 0) {
    const concurrency = Math.min(CONCURRENCY, vehicleIds.length);
    await prerenderVehiclesInBatches(browser, base, vehicleIds, concurrency);
  }

  // 3. Limpiar vehículos eliminados del stock
  cleanupRemovedVehicles(vehicleIds);

  await browser.close();
  serverProc?.kill?.();
  console.log('[prerender] Listo.');
}

prerender().catch((e) => {
  console.error(e);
  process.exit(1);
});
