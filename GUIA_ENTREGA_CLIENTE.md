# Best Cars Ibérica — Guía de entrega al cliente

## Resumen del proyecto

El proyecto consta de **tres partes** que trabajan juntas:

| Componente | Descripción | Puerto |
|------------|-------------|--------|
| **Backend (API)** | BestCars_Back-updated | 3001 |
| **Página web** | Bestcars_front_DEF — Landing con catálogo, contacto, prueba de manejo | 5173 |
| **Panel admin** | BestCars_Panel — Gestión de stock, leads y estadísticas | 5174 |

## ¿Qué usa el backend?

El backend **sirve a ambos**:

- **Página web**: Lista de vehículos, formulario de contacto, solicitud de prueba de manejo, escenas (composición del garaje)
- **Panel admin**: Login, CRUD vehículos, editor de escenas, listado de contactos y solicitudes de prueba

## Estado actual de integración

| Conexión | Estado |
|----------|--------|
| Página web → Backend | ✅ Conectada (vehículos, contacto, test-drive) |
| Panel → Backend | ✅ Conectado (login, CRUD vehículos, leads). Sin VITE_API_URL usa modo demo local |
| Backend → Supabase | ✅ Listo (configurar DATABASE_URL) |

## Configuración para producción (Supabase)

### 1. Backend — Variables de entorno

Crear `.env` en `BestCars_Back-updated/`:

```env
PORT=3001
NODE_ENV=production

# Supabase — Connection string desde: Dashboard > Settings > Database
DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true"

# CORS — URLs del frontend y panel
CORS_ORIGINS=https://tudominio.com,https://panel.tudominio.com

# Auth panel
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu-password-seguro
JWT_SECRET=clave-minimo-16-caracteres

# SendGrid
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@tudominio.com
RECIPIENT_EMAIL=ventas@tudominio.com
```

### 2. Sincronizar base de datos

```bash
cd BestCars_Back-updated
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

### 3. Página web

```bash
cd Bestcars_front_DEF
npm install
# Crear .env con: VITE_API_URL=https://api.tudominio.com
npm run build
# Servir la carpeta dist/
```

### 4. Panel

```bash
cd BestCars_Panel
npm install
# Crear .env con: VITE_API_URL=https://api.tudominio.com
npm run build
# Servir la carpeta dist/
```

## Despliegue recomendado

- **Backend**: Railway, Render, Fly.io o VPS con Node.js
- **Página web**: Vercel, Netlify o mismo servidor
- **Panel**: Subdominio separado (ej. panel.bestcars.com)
- **Supabase**: Ya configurado ✓

## Pruebas como entrega (build + serve)

Tras hacer build de web y panel, servir los builds para simular producción:

```bash
# Terminal 1: Backend
cd BestCars_Back-updated && npm start

# Terminal 2: Web
cd Bestcars_front_DEF && npm run serve

# Terminal 3: Panel
cd BestCars_Panel && npm run serve
```

Web en http://localhost:5173, Panel en http://localhost:5174.

## Checklist para entrega

- [ ] DATABASE_URL configurado en backend (reemplazar [YOUR-PASSWORD] en .env)
- [ ] db:push y db:seed ejecutados
- [ ] CORS_ORIGINS con URLs de producción
- [ ] SendGrid configurado (emails)
- [ ] Variables de entorno en frontend (VITE_API_URL)
- [ ] Build de frontend y panel sin errores
- [ ] Login del panel funciona
- [ ] Vehículos visibles en la web
- [ ] Formularios de contacto y prueba de manejo operativos
- [ ] Editor de escenas guarda y activa correctamente
- [ ] Garaje muestra la escena activa
- [ ] Credenciales documentadas para el cliente
