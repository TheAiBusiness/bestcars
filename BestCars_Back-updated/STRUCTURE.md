# Estructura del Proyecto

Documentación de la estructura del backend Best Cars API.

```
BestCars_Back-updated/
├── src/
│   ├── index.ts              # Punto de entrada
│   ├── config/
│   │   ├── app.ts            # Configuración Express, CORS, rate limit
│   │   ├── env.ts            # Validación de variables de entorno (Zod)
│   │   └── prisma.ts         # Cliente Prisma
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── contactController.ts
│   │   ├── healthController.ts
│   │   ├── testDriveController.ts
│   │   └── vehicleController.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT sign/verify, requireAuth
│   │   ├── errorHandler.ts
│   │   └── rateLimit.ts      # Rate limiters para forms y auth
│   ├── routes/
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── contactRoutes.ts
│   │   ├── testDriveRoutes.ts
│   │   └── vehicleRoutes.ts
│   ├── services/
│   │   └── emailService.ts   # SendGrid
│   └── types/
│       └── vehicle.ts
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── seed.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Rutas API

- `GET /api/health` - Health check
- `GET /api/vehicles` - Listar vehículos
- `GET /api/vehicles/:id` - Detalle vehículo
- `POST /api/auth/login` - Login admin
- `POST /api/contact` - Formulario contacto
- `GET /api/contact` - Listar contactos (auth)
- `PATCH /api/contact/:id` - Actualizar contacto (auth)
- `POST /api/test-drive` - Solicitud prueba de manejo
- `GET /api/test-drive` - Listar solicitudes (auth)
- `PATCH /api/test-drive/:id` - Actualizar solicitud (auth)
- `POST /api/vehicles` - Crear vehículo (auth)
- `PATCH /api/vehicles/:id` - Actualizar vehículo (auth)
- `DELETE /api/vehicles/:id` - Eliminar vehículo (auth)
