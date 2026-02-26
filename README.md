# BestCars Ibérica — Proyecto completo

Sistema integral para concesionario de vehículos premium: **página web pública**, **panel de administración** y **API backend**.

| Componente      | Descripción |
|-----------------|-------------|
| **Página web**  | Landing con catálogo, formulario de contacto y solicitud de prueba de manejo |
| **Panel admin** | Gestión de stock, leads, estadísticas y editor de escenas (garaje) |
| **API**         | Backend definitivo `Bestcars_Back_DEF` (completo + BD) |

---

## Estructura del repositorio

```
├── Bestcars_Back_DEF/       # API backend definitivo (Node, Express, Prisma, Supabase)
├── Bestcars_front_DEF/      # Página web (React, Vite)
├── BestCars_Panel/          # Panel de administración (React, Vite)
├── DEPLOY.md                # Guía de despliegue
├── GUIA_ENTREGA_CLIENTE.md  # Configuración y entrega al cliente
├── CHECKLIST-DEPLOY.md      # Checklist pre-deploy
├── build-all.ps1            # Build de todos los proyectos (Windows)
└── build-all.sh             # Build de todos los proyectos (Mac/Linux)
```

---

## Requisitos

- **Node.js** 18+ (recomendado 20 LTS)
- **npm** (o pnpm en front/panel)

---

## Inicio rápido (desarrollo local)

### 1. Backend (único backend definitivo)

```bash
cd Bestcars_Back_DEF
cp .env.example .env
# Configura DATABASE_URL (Supabase), ADMIN_PASSWORD, JWT_SECRET y CORS_ORIGINS
npm install
npm run db:push   # solo si usas DB real
npm run dev
```

El backend queda en **http://localhost:3001**

### 2. Página web

```bash
cd Bestcars_front_DEF
cp .env.example .env
# .env: VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

Abre la URL que indique Vite (p. ej. **http://localhost:5173**).

### 3. Panel de administración

```bash
cd BestCars_Panel
cp .env.example .env
# .env: VITE_API_URL=http://localhost:3001 (opcional; sin esto = modo demo)
npm install
npm run dev
```

Panel en **http://localhost:5174** (o el puerto que muestre Vite).

**Credenciales por defecto (Back_DEF):** usuario `admin`, contraseña `admin`. En producción usar las configuradas en el backend.

---

## Cómo se conectan

| Componente   | Puerto | Conecta a |
|-------------|--------|-----------|
| Backend     | 3001   | Supabase (si `DATABASE_URL` configurada) |
| Página web  | 5173   | Backend (vehículos, contacto, test-drive, escenas) |
| Panel       | 5174   | Backend (login, vehículos, leads, escenas) o modo demo (localStorage) |

- **Panel con `VITE_API_URL`:** usa la API (login, datos reales).
- **Panel sin `VITE_API_URL`:** modo demo con datos en `localStorage`.

---

## Build y despliegue

**Guía detallada:** [DEPLOY.md](./DEPLOY.md) — variables de producción, pasos por componente, checklist y opciones de hosting.

**Railway (monorepo):** [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) — deploy del repo Arennull/bestcars con tres servicios (Root Directory: `Bestcars_Back_DEF`, `Bestcars_front_DEF`, `BestCars_Panel`).

**Túneles Cloudflare (probar en local con URLs públicas):** [TUNELES_CLOUDFLARE.md](./TUNELES_CLOUDFLARE.md) — exponer backend, web y panel con `.\run-tunnels-cloudflare.ps1`.

Build de todos los proyectos desde la raíz:

```powershell
.\build-all.ps1
```

En Linux/Mac:

```bash
chmod +x build-all.sh && ./build-all.sh
```

Checklist rápido: [CHECKLIST-DEPLOY.md](./CHECKLIST-DEPLOY.md).

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [DEPLOY.md](./DEPLOY.md) | Pasos de deploy, variables de entorno, checklist |
| [GUIA_ENTREGA_CLIENTE.md](./GUIA_ENTREGA_CLIENTE.md) | Configuración producción, Supabase, entrega al cliente |
| [CHECKLIST-DEPLOY.md](./CHECKLIST-DEPLOY.md) | Lista de comprobación pre y post deploy |
| [QA_REPORT.md](./QA_REPORT.md) | Informe QA y correcciones realizadas |
| [MEJORAS_RECOMENDADAS.md](./MEJORAS_RECOMENDADAS.md) | Mejoras sugeridas antes/después de entrega |

Cada subproyecto (Back-updated, Back_DEF, front, panel) tiene su propio **README.md** y **.env.example** (y opcionalmente `.env.production.example`).
