# Revisión a fondo: Panel de control y conexión con la web

## Resumen ejecutivo

El panel de control (BestCars_Panel) y la web pública (Bestcars_front_DEF) comparten el backend (Bestcars_Back_DEF). Casi toda la funcionalidad del panel **tiene conexión real** con la API y, por tanto, con lo que ve el usuario en la web. Se han detectado y corregido puntos concretos para que todo esté conectado y operativo.

---

## 1. Panel de control (BestCars_Panel)

### 1.1 Stock (Gestión de vehículos)

| Funcionalidad | Conexión | Detalle |
|--------------|----------|---------|
| Listado de vehículos | ✅ API | `getVehicles()` al cargar (con login). Sin API: localStorage + mock. |
| Crear vehículo | ✅ API | `createVehicle()` → POST `/api/vehicles`. El nuevo vehículo aparece en la web al recargar. |
| Editar vehículo (nombre, marca, modelo, año, precio, especificaciones, etiquetas, descripción, estado, imágenes) | ✅ API | `updateVehicle()` → PATCH `/api/vehicles/:id`. Cambios visibles en la web. |
| Eliminar vehículo | ✅ API | `deleteVehicle()` → DELETE `/api/vehicles/:id`. Deja de mostrarse en la web. |
| Reordenar (drag & drop) | ✅ API | `updateVehicle(..., { priority })` por cada vehículo. Orden usado en la web. |
| Búsqueda / filtro | ✅ Local | Filtra sobre los datos ya cargados (API o localStorage). |

**Conclusión:** Stock está totalmente conectado; lo que se gestiona aquí es lo que consume la web (listados, ficha, garage, escena).

---

### 1.2 Leads (Contactos y pruebas de manejo)

| Funcionalidad | Conexión | Detalle |
|--------------|----------|---------|
| Listado de contactos | ✅ API | `getContacts()` → GET `/api/contact`. Son los envíos del formulario de contacto de la web. |
| Listado de pruebas de manejo | ✅ API | `getTestDrives()` → GET `/api/test-drive`. Son las solicitudes del formulario de prueba de manejo en la web. |
| Cambiar estado del lead (nuevo / contactado / cerrado) | ✅ API | `updateContact()` / `updateTestDrive()` → PATCH. |
| Añadir / editar notas | ✅ API | Mismo PATCH con `notes`. |

**Conclusión:** Leads refleja en tiempo real los contactos y las solicitudes de prueba de manejo que llegan desde la web (formulario contacto + formulario prueba de manejo, una vez integrado).

---

### 1.3 Estadísticas y rendimiento

| Funcionalidad | Conexión | Detalle |
|--------------|----------|---------|
| Vistas totales / por vehículo | ✅ API | Los vehículos vienen con `views` desde GET `/api/vehicles` (backend cuenta POST `/api/vehicles/:id/track` con `type: 'view'`). |
| Clics (CTA) | ✅ API | Igual con `clicks` (track con `type: 'click'`). |
| Leads / conversión | ✅ API | `leads` por vehículo y totales desde la BD (contact + test-drive). |
| Gráficos (barras, líneas, top 3) | ✅ Datos | Usan los mismos `vehicles` (views, clicks, leads) del panel. |

**Requisito:** La web debe llamar a `trackVehicleView(vehicleId)` en la ficha y `trackVehicleClick(vehicleId)` en el CTA (ya implementado en `VehicleDetailPage`). Si no se llama track, las cifras de vistas/clics no cambian.

**Conclusión:** Estadísticas están conectadas a la web vía API (track + contact/test-drive).

---

### 1.4 Editor de escenas

| Funcionalidad | Conexión | Detalle |
|--------------|----------|---------|
| Listar escenas | ✅ API | `getScenes()` → GET `/api/scenes`. |
| Escena activa (lo que ve la web) | ✅ API | `getActiveScene()` → GET `/api/scenes/active`. Se marca como "Escena principal — Best Cars Ibérica". |
| Crear escena | ✅ API | `createScene()` → POST `/api/scenes`. |
| Editar escena (fondo, posiciones, vehículos por slot) | ✅ API | `updateScene()` → PATCH `/api/scenes/:id`. |
| Eliminar escena | ✅ API | `deleteScene()` → DELETE. La escena principal no se puede eliminar. |
| Activar en web | ✅ API | `setActiveScene(id)` → PATCH `/api/scenes/:id/activate`. Es lo que muestra la web en `/` y `/garage`. |

**Conclusión:** El editor de escenas controla exactamente la escena que ve el usuario en la web (home y garage).

---

### 1.5 Configuración

| Funcionalidad | Conexión | Detalle |
|--------------|----------|---------|
| Cambiar contraseña | ✅ API | `changePassword()` → PATCH `/api/auth/password`. |
| Perfil (nombre, email, rol) | ⚠️ Solo UI | Campos con valores por defecto; **no se guardan en el backend**. No hay endpoint de perfil de usuario. |
| Notificaciones (toggles) | ⚠️ Solo UI | No persisten en API. |
| Idioma / zona horaria | ⚠️ Solo UI | Solo español; no persisten. |

**Recomendación:** Si en el futuro se quiere perfil/notificaciones reales, haría falta un endpoint de usuario (ej. GET/PATCH `/api/auth/me` o similar) y guardar preferencias en BD.

---

### 1.6 Vista Web

| Funcionalidad | Conexión | Detalle |
|--------------|----------|---------|
| URL de la web | ✅ LocalStorage | `bestcars_web_preview_url`. Por defecto `http://localhost:5173` o `VITE_WEB_PREVIEW_URL`. |
| Iframe de la web | ✅ Directo | Carga la URL; lo que se ve es la web real (mismos datos que la API). |
| Actualizar vista | ✅ Funcional | Recarga el iframe para ver cambios tras editar stock/escenas. |
| Abrir en nueva pestaña | ✅ Funcional | Enlace a la misma URL. |
| Miniestadísticas (publicados, vistas, CVR) | ✅ Datos del panel | Mismos `vehicles` que el resto del panel (vistas/clics/leads desde API). |

**Conclusión:** Vista Web es el panel de control sobre la web en vivo; todo lo que se cambia en el panel se refleja al actualizar la vista o recargar la web.

---

### 1.7 Login y autenticación

| Funcionalidad | Conexión | Detalle |
|--------------|----------|---------|
| Login | ✅ API | POST `/api/auth/login`; token en `localStorage` (`bestcars_admin_token`). |
| Uso del token | ✅ API | Todas las mutaciones (vehicles, scenes, contact, test-drive, password) envían el token. |
| Cerrar sesión | ✅ Local | Borra token; el panel sigue en modo “solo lectura” si no hay `VITE_API_URL`. |

**Conclusión:** Auth está conectada al backend; sin token no se pueden hacer cambios desde el panel.

---

## 2. Web pública (Bestcars_front_DEF)

### 2.1 Páginas y datos

| Página | Origen de datos | Conexión |
|--------|------------------|----------|
| `/` (Home) | Imagen + hotspots | `getAllVehicles()` para datos de coches. ✅ |
| `/garage` | Escena + vehículos | `getActiveScene()`, `getAllVehicles()`. ✅ |
| `/vehicle/:id` | Ficha + contacto | `getVehicleById(id)`, `trackVehicleView(id)`, `trackVehicleClick(id)`, `submitContact()`. ✅ |
| `/scene-preview` | Escena + postMessage | `getActiveScene()`, `getAllVehicles()`; recibe estado del panel por postMessage. ✅ |
| Menú Stock (drawer) | Vehículos | `getAllVehicles()`. ✅ |

### 2.2 Formularios que generan leads

| Formulario | Endpoint | Panel |
|------------|----------|--------|
| Contacto (ficha de vehículo) | POST `/api/contact` | ✅ Leads → Contactos |
| Prueba de manejo (quiz) | POST `/api/test-drive` | ✅ Leads → Pruebas de manejo (tras integrar `QuizForm` en la ficha) |

**Corrección aplicada:** El componente `QuizForm` (solicitar prueba de manejo) existía pero **no estaba enlazado** en ninguna ruta. Se ha integrado en la ficha del vehículo (`VehicleDetailPage`) y se ha añadido el botón "Solicitar prueba de manejo" en `ProductHeader`, de modo que las solicitudes se envían a la API y aparecen en el panel en Leads.

---

## 3. Backend (Bestcars_Back_DEF)

Endpoints usados por panel y web, alineados:

- **Vehículos:** GET (web + panel), POST/PATCH/DELETE (panel), GET images, POST track.
- **Contact:** POST (web), GET/PATCH (panel).
- **Test-drive:** POST (web, desde `QuizForm`), GET/PATCH (panel).
- **Escenas:** GET / GET active (web + panel), POST/PATCH/DELETE/activate (panel).
- **Auth:** POST login, PATCH password (panel).

No se han detectado endpoints huérfanos ni rutas del panel sin uso en backend.

---

## 4. Checklist de funcionalidad y conexión

- [x] Stock: CRUD y reorden conectados a API; la web muestra los mismos vehículos.
- [x] Leads: Contactos y pruebas de manejo desde la web; listado y actualización en el panel.
- [x] Estadísticas: Vistas/clics desde track en la web; leads desde contact + test-drive.
- [x] Escenas: Crear/editar/activar en panel; web usa escena activa en home y garage.
- [x] Vista Web: Iframe de la web real; "Actualizar vista" para ver cambios.
- [x] Login/Logout y cambio de contraseña conectados a API.
- [x] Formulario de contacto en la web → Leads en el panel.
- [x] Formulario de prueba de manejo en la web → Leads en el panel (tras integrar `QuizForm`).
- [ ] Perfil / notificaciones / idioma en Configuración: solo UI; opcional implementar API más adelante.

---

## 5. Cómo comprobar que todo está conectado

1. **Backend y BD:** Arrancar `Bestcars_Back_DEF` con `npm run dev` (puerto 3001) y `DATABASE_URL` configurada.
2. **Panel:** `BestCars_Panel` con `VITE_API_URL=http://localhost:3001`; login y navegar por Stock, Leads, Escenas, Vista Web.
3. **Web:** `Bestcars_front_DEF` con `VITE_API_URL=http://localhost:3001`.
4. En la web: enviar un contacto desde la ficha de un vehículo → en el panel, Leads debe mostrar el contacto.
5. En la web: en la ficha de un vehículo, pulsar "Solicitar prueba de manejo", completar y enviar → en el panel, Leads debe mostrar la solicitud de prueba de manejo.
6. En el panel: crear/editar vehículo o escena, "Actualizar vista" en Vista Web → la web debe reflejar los cambios.
7. En el panel: Estadísticas debe mostrar vistas/clics si la web ha cargado fichas y el usuario ha hecho clic en CTA (track implementado en `VehicleDetailPage`).

Con esto, el panel funciona como panel de control de la web y todo lo que hay en el panel con funcionalidad está conectado a la página web vía API.
