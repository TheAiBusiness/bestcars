# BestCars Ibérica — Proyecto completo

Sistema integral para concesionario de vehículos premium: página web pública, panel de administración y API backend con Supabase.

## Estructura del proyecto

```
Bestcars_panelDef/
├── BestCars_Back-updated/   # API (Node.js, Express, Prisma)
├── Bestcars_front_DEF/      # Página web (React, Vite)
├── BestCars_Panel/          # Panel admin (React, Vite)
└── GUIA_ENTREGA_CLIENTE.md  # Guía detallada de entrega
```

## Inicio rápido (desarrollo local)

### 1. Backend

```bash
cd BestCars_Back-updated
cp .env.example .env
# Editar .env: reemplazar [YOUR-PASSWORD] en DATABASE_URL (Supabase > Settings > Database)
# Configurar ADMIN_PASSWORD, CORS_ORIGINS
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

El backend corre en **http://localhost:3001**

### 2. Página web

```bash
cd Bestcars_front_DEF
cp .env.example .env
# .env: VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

La web corre en **http://localhost:5173**

### 3. Panel admin

```bash
cd BestCars_Panel
cp .env.example .env
# .env: VITE_API_URL=http://localhost:3001 (opcional; sin esto usa modo demo)
npm install
npm run dev
```

El panel corre en **http://localhost:5174**

**Credenciales del panel**: Las configuradas en `ADMIN_USERNAME` y `ADMIN_PASSWORD` del backend.

### Pruebas como entrega (build + serve)

```bash
# Backend
cd BestCars_Back-updated && npm run build && npm start

# Web (otra terminal)
cd Bestcars_front_DEF && npm run build && npm run serve

# Panel (otra terminal)
cd BestCars_Panel && npm run build && npm run serve
```

Web en http://localhost:5173, Panel en http://localhost:5174.

## Integración

| Componente | Puerto | Conecta a |
|------------|--------|------------|
| Backend | 3001 | Supabase (PostgreSQL) |
| Página web | 5173 | Backend (vehículos, contacto, test-drive, escenas) |
| Panel | 5174 | Backend (auth, CRUD, leads, escenas) |

**Editor de escenas**: El panel permite crear escenas (fondos + vehículos posicionados). La página `/garage` muestra la escena activa. La ruta `/scene-preview` sirve como vista previa en vivo para el editor.

- **Con `VITE_API_URL`**: Panel usa API real (login, vehículos, leads).
- **Sin `VITE_API_URL`**: Panel funciona en modo demo con datos locales.

## Deploy

**Guía completa:** [DEPLOY.md](./DEPLOY.md) — variables de producción, pasos por componente, checklist y opciones de hosting.

Build de todos los proyectos (desde la raíz):

```powershell
.\build-all.ps1
```

En Linux/Mac: `chmod +x build-all.sh && ./build-all.sh`

## Documentación

- [GUIA_ENTREGA_CLIENTE.md](./GUIA_ENTREGA_CLIENTE.md) — configuración de producción y Supabase
- [DEPLOY.md](./DEPLOY.md) — pasos de despliegue
