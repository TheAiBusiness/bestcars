# Best Cars — API Backend

API REST para Best Cars Ibérica. Conecta con el frontend en `Bestcars_front_DEF`.

## Modos de funcionamiento

- **MOCK** (sin `DATABASE_URL`): Usa datos de ejemplo (car-1 a car-5). Ideal para desarrollo.
- **Producción** (con `DATABASE_URL`): Conecta a PostgreSQL (Supabase) con Prisma.

## Inicio rápido

```bash
npm install
cp .env.example .env
# Opcional: configurar DATABASE_URL para usar base de datos real
npm run db:generate   # Solo si usas DB
npm run dev
```

El servidor arranca en `http://localhost:3001`.

## Variables de entorno

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `PORT` | Puerto del servidor | 3001 |
| `CORS_ORIGINS` | Orígenes permitidos (frontend) | localhost:5173, 5174 |
| `DATABASE_URL` | PostgreSQL (Supabase) | Vacío = modo MOCK |
| `SENDGRID_API_KEY` | API key SendGrid | Requerido para emails |
| `FROM_EMAIL` | Email remitente | dev@theaibusiness.com |
| `RECIPIENT_EMAIL` | Email destinatario | dev@theaibusiness.com |

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/vehicles` | Lista de vehículos |
| GET | `/api/vehicles/:id` | Detalle de vehículo |
| POST | `/api/contact` | Formulario de contacto |
| POST | `/api/test-drive` | Solicitud de prueba de manejo |

## Integración con frontend

El frontend (`Bestcars_front_DEF`) usa `VITE_API_URL` (por defecto `http://localhost:3001`).

**Desarrollo local:**
1. Terminal 1: `cd Bestcars_Back_DEF && npm run dev`
2. Terminal 2: `cd Bestcars_front_DEF && npm run dev`
3. Abrir `http://localhost:5173`

## Scripts

- `npm run dev` — Servidor con hot-reload
- `npm run build` — Compilar TypeScript
- `npm start` — Servidor producción (tras `build`)
- `npm run db:generate` — Generar cliente Prisma
- `npm run db:push` — Sincronizar esquema (desarrollo)
- `npm run db:seed` — Poblar datos de ejemplo
