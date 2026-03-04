# Optimización imagen hero — LCP

## Problema

La imagen hero de la Home (`Bestcars-home.png`) pesaba **~11.7 MB**, penalizando gravemente el LCP.

## Solución implementada

### 1. Script de optimización (build time)

**Archivo:** `scripts/optimize-hero.mjs`

- Usa **sharp** para convertir la imagen original (5803×3264) a formatos modernos.
- Genera en `public/hero/`:
  - **Desktop (1920w):** WebP (85), AVIF (75), JPEG fallback (85)
  - **Mobile (768w):** WebP (85), AVIF (75)

### 2. Pesos resultantes

| Archivo | Peso | Objetivo |
|---------|------|----------|
| hero-desktop.webp | **416 KB** | < 500 KB ✓ |
| hero-desktop.avif | **423 KB** | < 500 KB ✓ |
| hero-mobile.webp | **71 KB** | < 200 KB ✓ |
| hero-mobile.avif | **80 KB** | < 200 KB ✓ |
| hero-desktop.jpg (fallback) | **465 KB** | < 500 KB ✓ |

**Reducción:** ~11.7 MB → ~416 KB (desktop) / ~71 KB (móvil) ≈ **96% menos**

### 3. Componente HomePage

Se usa `<picture>` con múltiples fuentes:

```html
<picture>
  <source type="image/avif" srcSet="... 1920w, ... 768w" sizes="100vw" />
  <source type="image/webp" srcSet="... 1920w, ... 768w" sizes="100vw" />
  <img src="/hero/hero-desktop.jpg" ... />
</picture>
```

### 4. Preload en index.html

El plugin Vite inyecta tras el build:

```html
<link rel="preload" as="image" href="/hero/hero-desktop.webp" type="image/webp" fetchpriority="high" media="(min-width: 769px)">
<link rel="preload" as="image" href="/hero/hero-mobile.webp" type="image/webp" fetchpriority="high" media="(max-width: 768px)">
```

### 5. Build

```bash
npm run build
```

El script `optimize-hero.mjs` se ejecuta automáticamente antes de `vite build`.

## Archivos modificados

| Archivo | Cambios |
|---------|---------|
| `scripts/optimize-hero.mjs` | Nuevo — genera WebP, AVIF, JPEG |
| `src/app/pages/HomePage.tsx` | `<picture>` con srcset, URLs optimizadas |
| `src/app/pages/ScenePreviewPage.tsx` | Fallback a `/hero/hero-desktop.jpg` |
| `vite.config.ts` | Preload WebP con media queries |
| `package.json` | `optimize-hero` en build y build:prerender |
