# Prerender para SEO (SPA)

## Problema

La web es una SPA con Client-Side Rendering. Los crawlers que no ejecutan JavaScript (Bing, redes sociales) reciben HTML vacío: solo `<div id="root">` y los meta de `index.html`.

## Solución implementada: prerender post-build

Se añadió un script que, tras el build de Vite:

1. Obtiene la lista de vehículos activos desde el sitemap o la API
2. Sirve `dist/` con `vite preview`
3. Usa Puppeteer para visitar cada ruta (estáticas + fichas de vehículos)
4. Espera a que React renderice
5. Guarda el HTML completo en archivos estáticos

### Rutas prerenderizadas

**Páginas estáticas:**

- `/` (Home)
- `/garage`
- `/experiencia`
- `/terminos`
- `/privacidad`

**Fichas de vehículos dinámicas:**

- `/vehicle/:id` — una por cada vehículo activo en stock
- Se generan en `dist/vehicle/{id}/index.html`

**No incluidas:** `/scene-preview` (Disallow en robots.txt)

### Comandos

```bash
# Build normal (sin prerender)
npm run build

# Build + prerender (HTML con contenido para crawlers)
npm run build:prerender
```

### Requisitos

1. **Backend API en marcha** durante el prerender:
   - Para páginas estáticas (Home, Garage, Experiencia): si la API no responde, pueden quedar en loading.
   - Para fichas de vehículos: el script obtiene los IDs desde `{VITE_API_URL}/sitemap.xml` o `{VITE_API_URL}/api/vehicles`. Si la API no está disponible, **no falla**: solo se prerenderizan las páginas estáticas.
2. **Puppeteer**: devDependency del proyecto.
3. **Vite preview**: usado para servir `dist/` durante el prerender.

### Variables de entorno

| Variable       | Descripción                          | Por defecto          |
|----------------|--------------------------------------|----------------------|
| `VITE_API_URL` | URL base de la API (sitemap, vehicles)| `http://localhost:3001` |

### Comportamiento y casos límite

- **API no disponible**: el script avisa y prerenderiza solo las páginas estáticas. No falla el build.
- **Vehículo eliminado del stock**: en el siguiente build, el HTML de ese vehículo se elimina automáticamente (`dist/vehicle/{id}/`).
- **Timeout por página**: 10 segundos. Si una ficha tarda más, se registra el error y se continúa con el resto.
- **Concurrencia**: si hay muchos vehículos (>50), se procesan hasta 4 en paralelo para no saturar memoria.
- **Progreso**: se muestra en consola: `[prerender] Vehículo 12/47: abc123`.

### Contenido del HTML prerenderizado

Las fichas de vehículos incluyen (si la app los genera correctamente):

- Meta tags dinámicos: `title`, `description`, Open Graph, Twitter Cards
- JSON-LD de tipo `Car` con los datos del vehículo
- Contenido visible dentro de `#root` (no solo el shell vacío)

### Despliegue

En CI/CD, ejecutar `npm run build:prerender` en lugar de `npm run build`. Asegurarse de que la API esté accesible (por ejemplo, apuntando a staging/producción con `VITE_API_URL`).

### Hosting estático

El host debe servir el HTML correcto por ruta:

- `/` → `index.html`
- `/garage` → `garage/index.html`
- `/vehicle/abc123` → `vehicle/abc123/index.html`
- `/terminos` → `terminos/index.html`
- etc.

Netlify, Vercel, GitHub Pages y similares ya lo hacen con esta estructura.

### Alternativas futuras

- **Opción B (middleware backend)**: detectar bots y servir HTML prerenderizado con Puppeteer en tiempo real.
- **SSR (Next.js / Vite SSR)**: migración más costosa, pero solución definitiva.
