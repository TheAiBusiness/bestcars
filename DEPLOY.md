# Guía de deploy — BestCars

Todo lo necesario para desplegar **página web**, **panel admin** y **API** en producción.

---

## 1. Resumen de componentes

| Componente        | Carpeta               | Build / Start        | Producción |
|-------------------|-----------------------|----------------------|------------|
| **API (recomendado)** | BestCars_Back-updated  | `npm run build` + `npm start` | Node 18+ (Railway, Render, VPS) |
| **API (alternativa)** | Bestcars_Back_DEF      | `npm run build` + `npm start` | Solo lectura + login; crear/editar → 501 |
| **Página web**    | Bestcars_front_DEF     | `npm run build`       | Servir `dist/` (Vercel, Netlify, Nginx) |
| **Panel admin**   | BestCars_Panel         | `npm run build`       | Servir `dist/` (subdominio o ruta) |

---

## 2. Variables de entorno para producción

### 2.1 Backend (elegir uno)

**Opción A: BestCars_Back-updated** (CRUD completo, escenas, BD)

Crear `BestCars_Back-updated/.env`:

```env
PORT=3001
NODE_ENV=production

# Supabase — Connection string (Dashboard > Settings > Database)
DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true"

# CORS — Orígenes permitidos (tu web y tu panel)
CORS_ORIGINS=https://tudominio.com,https://panel.tudominio.com

# Auth panel — ¡Cambiar en producción!
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu-password-seguro-minimo-12-chars
JWT_SECRET=clave-secreta-minimo-32-caracteres-aleatoria

# SendGrid (opcional)
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@tudominio.com
RECIPIENT_EMAIL=ventas@tudominio.com
```

**Opción B: Bestcars_Back_DEF** (lectura + login; sin BD = datos mock)

Crear `Bestcars_Back_DEF/.env`:

```env
PORT=3001
NODE_ENV=production

CORS_ORIGINS=https://tudominio.com,https://panel.tudominio.com

# Sin DATABASE_URL = modo mock (solo lectura de vehículos/contactos)
DATABASE_URL=

ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu-password-seguro
JWT_SECRET=clave-secreta-minimo-32-caracteres
```

### 2.2 Página web (Bestcars_front_DEF)

Antes del build, crear `.env` (o definir en la plataforma):

```env
VITE_API_URL=https://api.tudominio.com
```

Sustituir `https://api.tudominio.com` por la URL real de tu API.

### 2.3 Panel (BestCars_Panel)

Antes del build, crear `.env`:

```env
VITE_API_URL=https://api.tudominio.com
```

Misma URL que la API. Sin esta variable el panel funciona en modo demo (datos locales).

---

## 3. Pasos de deploy (orden recomendado)

### Paso 1: Backend

```bash
cd BestCars_Back-updated   # o Bestcars_Back_DEF
cp .env.example .env
# Editar .env con valores de producción (ver sección 2.1)

npm install
npm run db:generate        # solo Back-updated con BD
npm run db:push            # solo si usas DATABASE_URL
npm run db:seed            # opcional: datos iniciales
npm run build
npm start
```

En producción: usar `npm start` con un gestor de procesos (PM2, systemd) o desplegar en Railway/Render con `npm start` como comando.

### Paso 2: Página web

```bash
cd Bestcars_front_DEF
cp .env.example .env
# Poner VITE_API_URL=https://tu-api-url

npm install
npm run build
```

Subir el contenido de **`dist/`** a Vercel, Netlify o tu servidor (Nginx sirve la carpeta como estático).

### Paso 3: Panel

```bash
cd BestCars_Panel
cp .env.example .env
# Poner VITE_API_URL=https://tu-api-url

npm install
npm run build
```

Subir el contenido de **`dist/`** a un host estático (subdominio tipo `panel.tudominio.com` o ruta).

---

## 4. Probar en local como producción

```bash
# Terminal 1 — Backend
cd BestCars_Back-updated && npm run build && npm start

# Terminal 2 — Web
cd Bestcars_front_DEF && npm run build && npm run serve

# Terminal 3 — Panel
cd BestCars_Panel && npm run build && npm run serve
```

- Web: http://localhost:5173  
- Panel: http://localhost:5174  
- API: http://localhost:3001  

Ajustar en cada `.env` local: `VITE_API_URL=http://localhost:3001` y `CORS_ORIGINS=http://localhost:5173,http://localhost:5174`.

---

## 5. Checklist pre-deploy

- [ ] Backend: `.env` con `NODE_ENV=production`, `CORS_ORIGINS` con URLs reales
- [ ] Backend: `ADMIN_PASSWORD` y `JWT_SECRET` **no** por defecto (admin/admin)
- [ ] Backend (Back-updated): `DATABASE_URL` y `db:push` / `db:seed` si usas BD
- [ ] Web: `.env` con `VITE_API_URL` = URL pública del API
- [ ] Panel: `.env` con `VITE_API_URL` = URL pública del API
- [ ] Build sin errores: `npm run build` en backend, web y panel
- [ ] Login panel con usuario/contraseña de producción
- [ ] Web muestra vehículos y formularios (contacto, test drive)
- [ ] CORS: dominio de la web y del panel incluidos en `CORS_ORIGINS`

---

## 6. Dónde desplegar (sugerencias)

| Componente | Opciones |
|------------|----------|
| **API**    | Railway, Render, Fly.io, VPS (Node 18+) |
| **Web**    | Vercel, Netlify, Cloudflare Pages, Nginx |
| **Panel**  | Mismo que la web (otra carpeta/subdominio) o Vercel/Netlify |
| **BD**     | Supabase (ya contemplado en Back-updated) |

---

## 7. Archivos de referencia

- **Variables de ejemplo:** En cada carpeta, `.env.example` (y opcionalmente `.env.production.example`).
- **Entrega al cliente:** [GUIA_ENTREGA_CLIENTE.md](./GUIA_ENTREGA_CLIENTE.md).
- **QA y mejoras:** [QA_REPORT.md](./QA_REPORT.md), [MEJORAS_RECOMENDADAS.md](./MEJORAS_RECOMENDADAS.md).
