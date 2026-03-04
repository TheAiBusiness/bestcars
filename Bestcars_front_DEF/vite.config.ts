import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

/** Inyecta preload de la imagen hero LCP (WebP) tras el build para mejorar Core Web Vitals */
function preloadHeroImagePostBuild() {
  return {
    name: 'preload-hero-post',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist')
      const heroDir = path.join(outDir, 'hero')
      const indexPath = path.join(outDir, 'index.html')
      if (!fs.existsSync(heroDir) || !fs.existsSync(indexPath)) return
      let html = fs.readFileSync(indexPath, 'utf-8')
      if (html.includes('hero-desktop.webp')) return
      const preloads = [
        '<link rel="preload" as="image" href="/hero/hero-desktop.webp" type="image/webp" fetchpriority="high" media="(min-width: 769px)">',
        '<link rel="preload" as="image" href="/hero/hero-mobile.webp" type="image/webp" fetchpriority="high" media="(max-width: 768px)">',
      ].map((p) => `    ${p}`).join('\n')
      html = html.replace('</head>', `${preloads}\n  </head>`)
      fs.writeFileSync(indexPath, html)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    preloadHeroImagePostBuild(),
    ViteImageOptimizer({
      logStats: true,
      jpeg: { quality: 85 },
      jpg: { quality: 85 },
      png: { quality: 90 },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Permitir acceso via dominios de túnel (Cloudflare) u otros hosts
    allowedHosts: true,
  },
})
