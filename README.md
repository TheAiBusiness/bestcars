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

## Editor de escenas (panel)

En el panel, **Escenas** permite crear y editar la escena que se muestra en la web en **/garage** (botón «Entrar al garaje»):

1. **Crear / elegir escena** — Fondo (URL o imagen) y nombre.
2. **Añadir hotspots** — Selecciona un coche, activa «Añadir hotspot», clic en la imagen y arrastra para colocar.
3. **Guardar y publicar** — Persiste en el backend y deja esa escena como activa para la web.

La web en `/garage` carga la escena activa (`GET /api/scenes/active`), muestra el fondo y los hotspots en sus posiciones, y el listado de stock abierto por defecto.

---

## Build y despliegue

Build de todos los proyectos desde la raíz:

```powershell
.\build-all.ps1
```

En Linux/Mac:

```bash
chmod +x build-all.sh && ./build-all.sh
```

Cada subproyecto tiene su **README.md** y **.env.example**. Para producción: configurar `DATABASE_URL`, `VITE_API_URL` y credenciales en backend y front.
