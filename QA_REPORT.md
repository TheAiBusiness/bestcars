# Informe QA – Bestcars Panel + Backend DEF

**Fecha:** 2026-02-25  
**Alcance:** Panel (BestCars_Panel), Backend (Bestcars_Back_DEF), adaptadores, API y casos límite.

---

## Fallos detectados y corregidos

### 1. **Adapter vehículos – posible crash si la API devuelve formato inesperado**
- **Problema:** Si `api.specifications.motor` o `api.specifications.general` no son arrays (p. ej. JSON de Prisma distinto), `extractSpec(motorSpecs, …)` podía fallar (`.find` en no-array).
- **Corrección:** Uso de `Array.isArray(specs.motor) ? specs.motor : []` (y lo mismo para `general`). Comprobación de `api.tags` y `api.images` antes de acceder.

### 2. **Adapter leads – campos opcionales en test-drive**
- **Problema:** Si la API no envía `lastVehicle`, `interests`, `mainUse`, `age`, la concatenación en `notes` podía generar "undefined".
- **Corrección:** Uso de `?? ''` en esos campos en `apiTestDriveToLead`.

### 3. **Cliente API – error de red sin mensaje claro**
- **Problema:** Si `fetch` lanzaba (ej. "Failed to fetch"), el usuario veía un mensaje técnico.
- **Corrección:** `try/catch` en `fetchApi` y mensaje amigable: "No se pudo conectar al servidor. Comprueba que el backend esté en marcha."

### 4. **Backend – 404 en rutas que el panel usa**
- **Problema:** El panel llama a `POST/PATCH/DELETE /api/vehicles`, `PATCH /api/contact/:id`, `PATCH /api/test-drive/:id` y `GET/POST/PATCH/DELETE /api/scenes`. En Bestcars_Back_DEF no existían → 404.
- **Corrección:**
  - **Vehículos:** Añadidos `POST`, `PATCH /:id`, `DELETE /:id` que responden **501** con mensaje indicando usar BestCars_Back-updated o DATABASE_URL.
  - **Contact y test-drive:** Añadido `PATCH /:id` con **501**.
  - **Escenas:** Nuevo `sceneRoutes.ts`: `GET /api/scenes` → `[]`, `GET /api/scenes/active` → `null`; el resto (GET by id, POST, PATCH, DELETE) → **501**.

---

## Comportamiento esperado (sin errores)

| Caso | Resultado |
|------|-----------|
| Login admin/admin | 200 + token |
| Login incorrecto | 401 + "Invalid credentials" |
| GET /, /api/health, /api/vehicles | 200 |
| GET /api/scenes | 200 + [] |
| POST/PATCH/DELETE vehicles, PATCH contact/test-drive | 501 con mensaje claro |
| Panel sin backend | Toast con mensaje de conexión y uso de datos locales |

---

## Recomendaciones (no bloqueantes)

1. **Backend GET /api/contact y GET /api/test-drive (con DB):**  
   Si el schema Prisma tiene `status` y `notes`, incluirlos en la respuesta para que el panel muestre estado y notas de los leads.

2. **JWT_SECRET:**  
   En producción no usar el valor por defecto; definir `JWT_SECRET` fuerte en `.env`.

3. **Panel – TypeScript:**  
   El panel no tiene `typescript` en `devDependencies`; `npx tsc --noEmit` falla. Añadir `typescript` como devDependency si quieres comprobaciones de tipos en CI.

4. **Escenas:**  
   Para crear/editar/activar escenas hace falta BestCars_Back-updated; con Bestcars_Back_DEF el editor puede usarse pero las escenas no se persisten en API.

---

## Resumen

- **Corregidos:** 4 grupos de fallos (adaptadores, API client, rutas backend).
- **Probado:** Login, health, vehicles, scenes, respuestas 501.
- **Linter:** Sin errores en los archivos modificados.
- **Build backend:** `npm run build` correcto.
