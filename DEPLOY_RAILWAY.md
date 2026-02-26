# Deploy en Railway — Paso a paso

Guía para desplegar el **backend**, **web** y **panel** en [Railway](https://railway.app). Repositorio: **Arennull/bestcars** (monorepo). Cada servicio usa **Root Directory** y tiene `nixpacks.toml` para build/start automático.

---

## Comprobaciones previas (ya hechas)

- Backend: build OK, `/api/health` y login funcionan en local
- Web y panel: `npm run build` sin errores
- Backend usa `process.env.PORT || 3001` → compatible con Railway

---

## Cómo desplegar (elige una)

| Método | Ventaja | Requiere |
|--------|---------|----------|
| **A) Railway CLI (desde tu PC)** | No conectas GitHub; subes el código desde tu máquina | Cuenta Railway + CLI |
| **B) Desde GitHub** | Redeploy automático en cada push | Repo conectado a Railway (público o privado) |

Railway **sí permite repos privados** si conectas tu cuenta de GitHub y autorizas el acceso. Si aun así prefieres no vincular GitHub, usa la **Opción A (CLI)**.

---

## Opción A: Deploy desde tu PC (Railway CLI) — sin conectar GitHub

Así subes el backend (o lo que quieras) desde tu carpeta local. No hace falta que Railway vea tu repo.

### A.1 — Instalar Railway CLI

En PowerShell (Windows):

```powershell
npm install -g @railway/cli
```

O sin instalar global, con npx (desde la carpeta del backend):

```powershell
npx @railway/cli --version
```

### A.2 — Iniciar sesión

```powershell
railway login
```

Se abrirá el navegador para que entres con tu cuenta de Railway (email o GitHub, sin dar acceso a repos).

### A.3 — Crear proyecto y desplegar el backend

1. Abre la carpeta del backend:

```powershell
cd "ruta\Bestcars_panelDef\Bestcars_Back_DEF"
```

2. Vincula o crea un proyecto en Railway:

```powershell
railway init
```

- Si no tienes proyecto: elige **Create new project** y ponle nombre (ej. `bestcars-api`).
- Se crea un **service** vacío en ese proyecto.

3. Sube y despliega:

```powershell
railway up
```

La CLI empaqueta la carpeta actual (respetando `.gitignore`: no sube `node_modules` ni `.env`), la sube a Railway y lanza el build + start. La primera vez puede tardar un poco.

4. Añadir variables de entorno (obligatorio):

- En **https://railway.app** → tu proyecto → el **service** del backend.
- **Variables** (o **Environment**): añade al menos:
  - `NODE_ENV` = `production`
  - `CORS_ORIGINS` = `*` (para probar; luego pon las URLs de tu web/panel)
  - `ADMIN_PASSWORD` = tu contraseña segura
  - `JWT_SECRET` = una cadena aleatoria de al menos 32 caracteres

5. Generar dominio público:

- En el mismo service: **Settings** → **Networking** → **Generate Domain**.
- Copia la URL (ej. `https://bestcars-back-def-production-xxxx.up.railway.app`).

6. Redeploy si cambiaste variables:

- En la web: **Deployments** → **Redeploy**,  
  o desde la carpeta del backend: `railway up` de nuevo.

### A.4 — Siguientes despliegues (desde tu PC)

Cada vez que quieras actualizar el backend:

```powershell
cd "ruta\Bestcars_panelDef\Bestcars_Back_DEF"
railway up
```

No necesitas conectar GitHub en ningún momento.

### A.5 — Web y panel (también desde local)

Para la web o el panel como sitio estático en Railway:

1. Haz **build** en tu PC (en `Bestcars_front_DEF` o `BestCars_Panel`):

```powershell
npm run build
```

2. En Railway: **Add Service** → **Empty Service** (o “Deploy from local” si lo ofrecen).
3. Desde la carpeta donde está **dist** (la web o el panel), usa la CLI para subir. Railway puede servir una carpeta estática; en algunos flujos se usa `railway up` desde la raíz del front/panel con un **config** que indique “static site” y la carpeta `dist`.

Alternativa sencilla para web y panel: después de tener el backend en Railway, despliega la web y el panel en **Vercel** o **Netlify** desde tu PC con su CLI (también sin conectar GitHub), o sube la carpeta `dist` manualmente donde tengas hosting estático.

---

## Opción B: Monorepo desde GitHub (Arennull/bestcars)

Repositorio único con backend, web y panel. Creas **tres servicios** en el mismo proyecto, cada uno con su **Root Directory**.

### Paso 1 — Cuenta y proyecto

1. Entra en **https://railway.app** e inicia sesión (GitHub recomendado).
2. **New Project**.
3. Elige **Deploy from GitHub repo**.
4. Conecta GitHub y autoriza. Selecciona el repositorio **Arennull/bestcars**.
5. Railway crea un **service**. Lo configuramos como backend.

### Paso 2 — Configuración del servicio (Backend)

1. Entra en el **service** (clic en el recuadro).
2. **Settings**:
   - **Root Directory:** `Bestcars_Back_DEF`
   - **Build Command:** (opcional; si hay `nixpacks.toml` se usa automático) `npm install && npx prisma generate && npm run build`
   - **Start Command:** (opcional) `npm start`
   - **Watch Paths:** (opcional) `Bestcars_Back_DEF/**` para redeploy solo cuando cambie el backend.

3. **Variables** (pestaña *Variables* o *Environment*):
   - Añade las variables de entorno (sustituye valores de ejemplo):

| Variable | Valor (ejemplo) | Nota |
|----------|-----------------|------|
| `NODE_ENV` | `production` | |
| `PORT` | *(no hace falta)* | Railway la asigna |
| `DATABASE_URL` | URL PostgreSQL (Supabase) | **Requerida** para persistencia; añadir `?sslmode=require` si aplica |
| `JWT_SECRET` | *cadena-aleatoria-32-chars* | **Obligatorio** en producción |
| `ADMIN_USERNAME` | `admin` | Cambiar en producción |
| `ADMIN_PASSWORD` | *tu-contraseña-segura* | **Obligatorio cambiar** |
| `CORS_ORIGINS` | `https://tu-web.up.railway.app,https://tu-panel.up.railway.app` | Ajustar cuando tengas las URLs de web y panel (vacío al inicio) |

Para probar rápido sin web/panel aún, puedes poner:
`CORS_ORIGINS=*` (permite cualquier origen; luego lo restringes).

4. Guarda los cambios.

### Paso 3 — Red pública y URL

1. En el mismo service, ve a **Settings** → **Networking** (o pestaña *Networking*).
2. Activa **Generate Domain** (o **Public Networking**).
3. Railway te asigna una URL tipo:  
   `https://bestcars-back-def-production-xxxx.up.railway.app`
4. Copia esa URL: será tu **API base** (ej. `https://xxx.up.railway.app`).  
   La API estará en `https://xxx.up.railway.app/api` (p. ej. `https://xxx.up.railway.app/api/health`).

### Paso 4 — Deploy

1. Si no ha desplegado solo, en **Deployments** pulsa **Redeploy** (o haz un push al repo).
2. Espera a que el estado sea **Success** (verde).
3. Prueba en el navegador:  
   `https://tu-url.up.railway.app/api/health`  
   Deberías ver algo como: `{"status":"ok","message":"Best Cars API is running",...}`.

### Paso 5 — CORS con la URL real

1. Cuando tengas la URL pública del backend, actualiza **CORS_ORIGINS** en Variables con las URLs exactas de tu web y panel (separadas por coma, sin espacios).
2. Redeploy si hace falta (a veces Railway aplica variables sin redeploy).

---

## Parte 2: Web y panel en Railway (mismo monorepo Arennull/bestcars)

En el **mismo proyecto** Railway, añade dos servicios más desde el mismo repo. Cada uno tiene `nixpacks.toml` y script `npm start` que sirve `dist/` (usa `PORT` de Railway).

### Web pública

1. **New** → **GitHub Repo** → **Arennull/bestcars** (segundo service).
2. **Settings**:
   - **Root Directory:** `Bestcars_front_DEF`
   - **Build Command:** (opcional) `npm install && npm run build`
   - **Start Command:** (opcional) `npm start` (sirve `dist/` con el paquete `serve`)
3. **Variables:** `VITE_API_URL` = URL pública del backend (sin barra final).
4. **Generate Domain**. Anota la URL de la web.

### Panel de administración

1. **New** → **GitHub Repo** → **Arennull/bestcars** (tercer service).
2. **Settings**:
   - **Root Directory:** `BestCars_Panel`
   - **Build Command:** (opcional) `npm install && npm run build`
   - **Start Command:** (opcional) `npm start`
3. **Variables:** `VITE_API_URL` = misma URL del backend.
4. **Generate Domain**. Anota la URL del panel.

Luego en el **backend**, edita **CORS_ORIGINS** con las URLs de la web y del panel (separadas por coma).

---

## Resumen de URLs

| Componente | Dónde | URL tipo |
|------------|--------|----------|
| API | Railway (Bestcars_Back_DEF) | `https://xxx.up.railway.app` → `/api/health`, `/api/auth/login`, etc. |
| Web | Railway static o Vercel/Netlify | `https://yyy.up.railway.app` (o tu dominio) |
| Panel | Railway static o Vercel/Netlify | `https://zzz.up.railway.app` (o tu dominio) |

---

## Checklist rápido

- [ ] Supabase: schema aplicado (`cd Bestcars_Back_DEF && npm run db:push`) antes del primer deploy
- [ ] Backend en Railway: Root Directory `Bestcars_Back_DEF`, variables `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CORS_ORIGINS`
- [ ] Generate Domain activado para backend, web y panel
- [ ] `/api/health` responde `{"ok":true,"database":"configured"}` en la URL del backend
- [ ] Web y panel con `VITE_API_URL` = URL del backend
- [ ] CORS_ORIGINS con las URLs reales de web y panel

---

## Si algo falla

- **502 / no responde:** Revisa que el **Start Command** sea `npm start` y que la app use `process.env.PORT` (tu backend ya lo hace).
- **CORS:** Asegura que `CORS_ORIGINS` incluya exactamente la URL del front (con `https://`, sin barra final).
- **Login falla:** Comprueba `ADMIN_PASSWORD` y `JWT_SECRET` en Variables del backend.

Cuando tengas la URL del backend en Railway, pásala a las variables `VITE_API_URL` de web y panel y actualiza `CORS_ORIGINS` con las URLs de web y panel.
