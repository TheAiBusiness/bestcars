# Qué añadiría antes o después de entregar al cliente

Priorizado por impacto y esfuerzo. Marca según vayas haciendo.

---

## Prioridad alta (recomendado antes de entrega)

### 1. Actualizar documentación con los dos backends
- **Qué:** En README y GUIA_ENTREGA aclarar que hay **dos** backends:
  - **BestCars_Back-updated**: completo (CRUD vehículos, actualizar leads, escenas). Para producción con BD.
  - **Bestcars_Back_DEF**: lectura + login (vehículos, contact/test-drive GET; crear/editar devuelve 501). Ideal para demo o cuando no hay BD.
- **Dónde:** README.md, GUIA_ENTREGA_CLIENTE.md.
- **Esfuerzo:** Bajo.

### 2. Guía de entrega de 1 página para el cliente
- **Qué:** Un PDF o página (ENTREGA_CLIENTE.pdf / ENTREGA_CLIENTE.md) con:
  - Qué recibe (web, panel, API).
  - Cómo arrancar en local (3 comandos).
  - Usuario y contraseña por defecto del panel (admin / admin en DEF; en Back-updated lo que pongan en .env).
  - Qué puede hacer y qué no con cada backend (tabla corta).
  - Enlace o resumen del QA (qué se ha probado).
- **Esfuerzo:** Bajo.

### 3. Cambio de contraseña por defecto en producción
- **Qué:** En la guía (y .env.example) dejar claro que en producción **no** se debe usar `ADMIN_PASSWORD=admin`. Añadir aviso en el panel si detecta que la API está en producción y el cliente no ha cambiado la contraseña (opcional).
- **Esfuerzo:** Bajo (solo doc + ejemplo).

---

## Prioridad media (mejoran la nota y la experiencia)

### 4. Página "Sin conexión" o estado claro en el panel
- **Qué:** Si no hay backend o falla la conexión, mostrar una vista clara ("Modo demo – datos locales" o "No se pudo conectar al servidor") en lugar de solo un toast.
- **Dónde:** BestCars_Panel (por ejemplo en App o en el layout cuando apiMode y error de carga).
- **Esfuerzo:** Medio.

### 5. Favicon y título del panel
- **Qué:** Favicon y `<title>` específicos del panel (ej. "BestCars – Panel de administración") en index.html del panel.
- **Dónde:** BestCars_Panel/index.html y asset favicon.
- **Esfuerzo:** Bajo.

### 6. Logout al expirar sesión
- **Qué:** Ya existe el evento `auth:session-expired`; asegurar que el panel redirige al login y muestra un mensaje ("Sesión expirada") cuando el token deja de ser válido.
- **Dónde:** AuthContext o App.
- **Esfuerzo:** Bajo (revisar flujo).

### 7. Variables de entorno validadas al arrancar (backend)
- **Qué:** Al iniciar, si `NODE_ENV=production` y falta `JWT_SECRET` o `ADMIN_PASSWORD` es "admin", log de advertencia o salida con mensaje claro.
- **Dónde:** Bestcars_Back_DEF y BestCars_Back-updated (start o config).
- **Esfuerzo:** Bajo.

---

## Prioridad baja (post-entrega o si hay tiempo)

### 8. Tests automáticos
- **Qué:** Tests E2E o de API (p. ej. login, GET /api/vehicles, GET /api/health) para no romper al hacer cambios.
- **Herramientas:** Vitest + supertest (backend), Playwright o Cypress (panel) si compensa.
- **Esfuerzo:** Medio–alto.

### 9. Implementar escritura en Bestcars_Back_DEF (opcional)
- **Qué:** Si el cliente quiere usar solo Back_DEF, implementar POST/PATCH/DELETE vehículos y PATCH contact/test-drive (en memoria o con BD).
- **Esfuerzo:** Alto.

### 10. Panel: recordar última pestaña o vista
- **Qué:** Guardar en localStorage la última sección visitada (Stock, Leads, etc.) y abrir ahí al volver.
- **Esfuerzo:** Bajo.

### 11. Rate limiting o intentos de login
- **Qué:** Límite de intentos de login por IP (Back-updated ya tiene authLimiter; en Back_DEF se podría añadir).
- **Esfuerzo:** Bajo.

### 12. Exportar leads (CSV/Excel)
- **Qué:** Botón en la sección Leads para descargar lista como CSV.
- **Esfuerzo:** Medio.

---

## Resumen rápido

| Añadido | Prioridad | Esfuerzo |
|---------|-----------|----------|
| Doc: dos backends + guía 1 página | Alta | Bajo |
| Aviso contraseña en producción | Alta | Bajo |
| Vista "Sin conexión" / modo demo | Media | Medio |
| Favicon + título panel | Media | Bajo |
| Logout al expirar sesión | Media | Bajo |
| Validar .env al arrancar backend | Media | Bajo |
| Tests automáticos | Baja | Medio–Alto |
| Escritura en Back_DEF | Baja (opcional) | Alto |
| Recordar última vista panel | Baja | Bajo |
| Exportar leads CSV | Baja | Medio |

Si solo puedes hacer algo: **1 + 2 + 3** (documentación y avisos de seguridad). Con eso la entrega queda clara y profesional.
