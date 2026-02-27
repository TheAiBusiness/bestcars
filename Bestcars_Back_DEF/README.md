# Best Cars — API Backend (definitivo)

API REST para Best Cars: web pública, panel de administración, leads, escenas y colocación de coches. Preparada para desplegar en **Railway** (o cualquier PaaS Node).

## Modos de funcionamiento

- **Con `DATABASE_URL`** (recomendado en producción): PostgreSQL (Supabase). Vehículos, contactos, test-drive y escenas se persisten.
- **Sin `DATABASE_URL`**: Modo MOCK (datos en memoria). Solo para desarrollo rápido.

## Inicio rápido

```bash
npm install
cp .env.example .env
# Configura DATABASE_URL (Supabase), JWT_SECRET, ADMIN_* y opcionalmente SendGrid
npm run db:push      # Sincroniza schema con la DB
npm run dev
```

Servidor en `http://localhost:3001`.

---

## Variables de entorno

| Variable | Descripción | Producción |
|----------|-------------|------------|
| `PORT` | Puerto del servidor | Railway lo asigna automáticamente |
| `NODE_ENV` | `development` / `production` | `production` |
| `CORS_ORIGINS` | Orígenes permitidos (separados por coma) | URL del frontend y del panel (ej. `https://tuweb.com,https://panel.tuweb.com`) |
| `DATABASE_URL` | URL de PostgreSQL (Supabase). En Railway usa la del **pooler** (puerto 6543). Para `prisma db push` usa la conexión directa (5432) desde local. | **Requerida** para persistencia |
| `JWT_SECRET` | Secreto para tokens del panel | **Cambiar** en producción |
| `ADMIN_USERNAME` | Usuario login panel | Cambiar en producción |
| `ADMIN_PASSWORD` | Contraseña login panel | Cambiar en producción |
| `SENDGRID_API_KEY` | API key SendGrid (emails) | Opcional; si falta, el formulario guarda pero no envía email |
| `FROM_EMAIL` | Email remitente | - |
| `RECIPIENT_EMAIL` | Email destinatario notificaciones | - |

---

## API — Endpoints

### Health (público)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Liveness: API activa |
| GET | `/api/health/ready` | Readiness: API + DB (Railway/K8s) |

### Auth (panel)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login; body: `{ username, password }` → `{ token }` |

### Vehículos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/vehicles` | No | Lista de vehículos |
| GET | `/api/vehicles/images/:filename` | No | Imagen de coche (ej. `AUDI RS6_42.jpg`) |
| GET | `/api/vehicles/:id` | No | Detalle de vehículo |
| POST | `/api/vehicles` | Sí | Crear vehículo |
| PATCH | `/api/vehicles/:id` | Sí | Actualizar vehículo |
| DELETE | `/api/vehicles/:id` | Sí | Eliminar vehículo |

### Contacto (leads)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/contact` | No | Envío formulario contacto (rate limit 20/hora por IP) |
| GET | `/api/contact` | Sí | Lista de contactos (leads) |
| PATCH | `/api/contact/:id` | Sí | Actualizar lead (status, notes) |

### Test-drive (leads)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/test-drive` | No | Envío solicitud prueba de manejo (rate limit 20/hora por IP) |
| GET | `/api/test-drive` | Sí | Lista de solicitudes |
| PATCH | `/api/test-drive/:id` | Sí | Actualizar lead (status, notes) |

### Escenas (editor del panel)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/scenes` | No | Lista de escenas |
| GET | `/api/scenes/active` | No | Escena activa (para la web) |
| GET | `/api/scenes/:id` | No | Detalle de escena |
| POST | `/api/scenes` | Sí | Crear escena |
| PATCH | `/api/scenes/:id` | Sí | Actualizar escena |
| PATCH | `/api/scenes/:id/activate` | Sí | Activar escena |
| DELETE | `/api/scenes/:id` | Sí | Eliminar escena |

Rutas con **Auth**: cabecera `Authorization: Bearer <token>` (token de `/api/auth/login`).

---

## Despliegue en Railway

1. **Crear proyecto** en [Railway](https://railway.app). Añadir servicio **Node** desde este repositorio (o subir carpeta `Bestcars_Back_DEF`).

2. **Variables de entorno** (Railway → Variables):
   - `DATABASE_URL`: URL de Supabase (PostgreSQL). En Supabase: Settings → Database → Connection string (modo Transaction).
   - `JWT_SECRET`: string aleatorio largo (ej. `openssl rand -base64 32`).
   - `ADMIN_USERNAME` y `ADMIN_PASSWORD`: credenciales del panel.
   - `CORS_ORIGINS`: URLs del frontend y del panel separadas por coma (ej. `https://bestcars.com,https://panel.bestcars.com`).
   - Opcional: `SENDGRID_API_KEY`, `FROM_EMAIL`, `RECIPIENT_EMAIL` para emails.

3. **Build y start**: Railway usa `railway.toml` / `nixpacks.toml`.
   - Build: `npm ci`, `prisma generate`, `npm run build`.
   - Start: `npm start` → `node dist/src/index.js`.
   - **No configures "Pre Deploy Command"** en Railway (Settings → Deploy). Si pones `npx prisma db push` ahí, el deploy puede quedarse colgado: Supabase con pooler (puerto 6543) no es adecuado para el motor de Prisma en ese paso.

4. **Base de datos**: Ejecutar **una vez** el schema en Supabase desde tu máquina (con conexión **directa**, puerto 5432):
   - En Supabase: Settings → Database → Connection string → **Session mode** (URI con puerto **5432**).
   - En local: `DATABASE_URL="postgresql://...:5432/postgres" npx prisma db push`
   - En producción usa la URL con **pooler (6543)** para `DATABASE_URL`; la app solo consulta, no ejecuta migraciones.

5. **Health**: Railway puede usar `GET /api/health` o `GET /api/health/ready` para comprobar que el servicio está listo.

---

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor con hot-reload (tsx) |
| `npm run build` | Prisma generate + compilar TypeScript |
| `npm start` | Servidor producción (tras `build`) |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:push` | Sincronizar schema con la DB (sin migraciones) |
| `npm run db:seed` | Poblar datos de ejemplo |
| `npm run copy-vehicle-images` | Copiar imágenes de vehículos desde el front al `public` del backend |

---

## Integración

- **Web** (`Bestcars_front_DEF`): `VITE_API_URL` = URL de esta API.
- **Panel** (`BestCars_Panel`): `VITE_API_URL` = misma URL; login con `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
