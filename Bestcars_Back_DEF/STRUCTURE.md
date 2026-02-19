# Project Structure

This document describes the folder structure of the Best Cars backend API.

```
BestCars_Back/
├── src/                          # Source code directory
│   ├── index.ts                  # Application entry point
│   ├── config/                   # Configuration files
│   │   ├── app.ts               # Express app configuration
│   │   └── database.ts          # Prisma client singleton (Supabase)
│   ├── controllers/             # Request handlers (business logic)
│   │   ├── vehicleController.ts # Vehicle-related operations
│   │   ├── contactController.ts # Contact form operations
│   │   └── healthController.ts  # Health check endpoint
│   ├── routes/                  # Route definitions
│   │   ├── index.ts            # Main router (aggregates all routes)
│   │   ├── vehicleRoutes.ts    # Vehicle routes
│   │   └── contactRoutes.ts    # Contact routes
│   ├── middleware/              # Express middleware
│   │   └── errorHandler.ts     # Error handling middleware
│   └── utils/                   # Utility functions
│       └── databaseInit.ts     # Database initialization
├── scripts/                     # Scripts
│   └── seed.ts                 # Database seeding script
├── prisma/                      # Prisma ORM
│   └── schema.prisma           # Database schema
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── .env                        # Environment variables (not in git)

```

## Directory Descriptions

### `src/`
Main source code directory containing all application logic.

### `src/config/`
Configuration files for the application:
- **app.ts**: Express application setup with middleware
- **database.ts**: Prisma client instance

### `src/controllers/`
Controllers handle the business logic for each route:
- **vehicleController.ts**: Handles vehicle CRUD operations
- **contactController.ts**: Handles contact form submissions
- **healthController.ts**: Health check endpoint

### `src/routes/`
Route definitions that map URLs to controller functions:
- **index.ts**: Main router that aggregates all routes
- **vehicleRoutes.ts**: Routes for `/api/vehicles`
- **contactRoutes.ts**: Routes for `/api/contact`

### `src/middleware/`
Custom Express middleware:
- **errorHandler.ts**: Global error handler and 404 handler

### `src/utils/`
Utility functions:
- **databaseInit.ts**: Database initialization and seeding logic

### `scripts/`
Standalone scripts:
- **seed.ts**: Database seeding script

### `prisma/`
Prisma ORM configuration:
- **schema.prisma**: Database schema definition

## API Routes

- `GET /api/health` - Health check
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact submissions (admin)

## File Flow

1. **Entry Point**: `src/index.ts` starts the server
2. **App Config**: `src/config/app.ts` sets up Express with middleware
3. **Routes**: `src/routes/index.ts` aggregates all route definitions
4. **Controllers**: Route handlers call controller functions
5. **Database**: Controllers use Prisma client from `src/config/database.ts`
