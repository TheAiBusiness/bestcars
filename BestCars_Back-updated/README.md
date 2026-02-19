# Best Cars — API Backend

API REST profesional para el concesionario Best Cars. Desarrollada con **TypeScript**, **Express** y **Prisma**, conectada a **PostgreSQL** (Supabase).

---

## Características

- **CRUD de vehículos** con especificaciones por categoría
- **Formulario de contacto** con envío de email (SendGrid)
- **Solicitudes de prueba de manejo** con notificación por email
- **Autenticación JWT** para panel de administración
- **Seguridad**: Helmet, rate limiting, CORS configurado
- **Validación de variables de entorno** al arranque
- **Manejo de errores** centralizado

---

## Requisitos

- Node.js 18+
- PostgreSQL (Supabase recomendado)
- Cuenta SendGrid (para emails)

---

## Instalación

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/TheAiBusiness/Bestcars_panelDef.git
cd Bestcars_panelDef/BestCars_Back-updated
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto (copiar desde `.env.example`):

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de datos (Supabase)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?schema=public

# CORS (orígenes permitidos, separados por coma)
CORS_ORIGINS=http://localhost:5173,https://tudominio.com

# Autenticación admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu-password-seguro
JWT_SECRET=clave-secreta-minimo-16-caracteres

# SendGrid (emails)
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@tudominio.com
RECIPIENT_EMAIL=ventas@tudominio.com
```

### 3. Inicializar base de datos

```bash
npm run db:generate
npm run db:push
npm run db:seed   # Opcional: datos de ejemplo
```

### 4. Iniciar servidor

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3001`.

---

## API Endpoints

### Públicos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/vehicles` | Listar vehículos |
| GET | `/api/vehicles/:id` | Detalle de vehículo |
| POST | `/api/auth/login` | Login admin |
| POST | `/api/contact` | Enviar formulario de contacto |
| POST | `/api/test-drive` | Solicitar prueba de manejo |

### Protegidos (requieren `Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/vehicles` | Crear vehículo |
| PATCH | `/api/vehicles/:id` | Actualizar vehículo |
| DELETE | `/api/vehicles/:id` | Eliminar vehículo |
| GET | `/api/contact` | Listar contactos |
| PATCH | `/api/contact/:id` | Actualizar contacto |
| GET | `/api/test-drive` | Listar solicitudes prueba |
| PATCH | `/api/test-drive/:id` | Actualizar solicitud |

---

## Ejemplos de uso

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"tu-password"}'
```

Respuesta: `{ "token": "eyJ...", "role": "admin" }`

### Formulario de contacto

```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "phone": "+34 600 000 000",
    "message": "Interesado en el Audi RS6"
  }'
```

### Solicitud de prueba de manejo

```bash
curl -X POST http://localhost:3001/api/test-drive \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "age": "35",
    "lastVehicle": "BMW 3 Series",
    "interests": "Deportivos",
    "mainUse": "Uso familiar"
  }'
```

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor desarrollo con hot-reload |
| `npm run build` | Compilar TypeScript |
| `npm start` | Iniciar servidor producción |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:push` | Sincronizar esquema (desarrollo) |
| `npm run db:migrate` | Ejecutar migraciones (producción) |
| `npm run db:seed` | Poblar datos de ejemplo |
| `npm run lint` | Ejecutar ESLint |
| `npm run lint:fix` | Corregir errores ESLint |
| `npm run format` | Formatear código con Prettier |

---

## Seguridad

- **Helmet**: cabeceras HTTP seguras
- **Rate limiting**: 100 req/15min API general, 20/hora formularios, 10/15min login
- **CORS**: orígenes configurados por variable de entorno
- **JWT**: tokens con expiración de 7 días

---

## Estructura del proyecto

```
BestCars_Back-updated/
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── seed.ts
├── src/
│   ├── config/       # app, prisma, env
│   ├── controllers/
│   ├── middleware/   # auth, errorHandler, rateLimit
│   ├── routes/
│   ├── services/     # emailService
│   ├── types/
│   └── index.ts
├── .env.example
└── package.json
```

---

## Licencia

ISC
