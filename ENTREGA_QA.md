# Best Cars Ibérica — Entrega para QA

**Entorno:** Túneles Cloudflare (URLs públicas temporales).  
**Fecha:** Actualizar al entregar.

---

## 1. URLs de acceso

### Web (página pública)

https://backup-vintage-javascript-defined.trycloudflare.com/

**backup-vintage-javascript-defined.trycloudflare.com** · **Best Cars Ibérica | Coches de alta gama**

Landing del concesionario: stock, formulario de contacto, solicitud de prueba de manejo.

---

### Panel de administración

https://which-debug-miracle-cam.trycloudflare.com/

**which-debug-miracle-cam.trycloudflare.com** · **BestCars Ibérica | Panel de Gestión**

Gestión de stock, leads (contacto y test-drive), estadísticas y escenas (garaje).

---

### Backend (API)

https://circulation-flex-wallpapers-locking.trycloudflare.com/

**circulation-flex-wallpapers-locking.trycloudflare.com** · **Best Cars API**

Comprobar: `GET https://circulation-flex-wallpapers-locking.trycloudflare.com/api/health` → debe devolver `{"ok":true,...}`.

---

## 2. Credenciales del panel

| Campo        | Valor  |
|-------------|--------|
| **Usuario** | `admin` |
| **Contraseña** | `admin` *(cambiar en producción)* |

Solo para el **Panel de administración**. La web es pública y no requiere login.

---

## 3. Checklist de pruebas (QA)

### Web (página pública)

- [ ] La página carga sin errores en escritorio y móvil.
- [ ] Se muestran los vehículos del stock con imagen y datos.
- [ ] Al hacer clic en un vehículo se abre la ficha (detalle) con galería de imágenes.
- [ ] Formulario de **contacto**: rellenar y enviar; comprobar que no da error y que aparece mensaje de éxito.
- [ ] Formulario de **solicitud de prueba de manejo**: rellenar y enviar; comprobar mensaje de éxito.
- [ ] Navegación: menú, enlaces y botones funcionan (Stock, Contacto, etc.).
- [ ] No hay errores en la consola del navegador (F12) que impidan el uso.

### Panel de administración

- [ ] **Login:** entrar con `admin` / `admin`; debe acceder al panel sin error.
- [ ] **Gestión de stock:** se listan los vehículos; las imágenes de los coches se ven correctamente.
- [ ] Abrir detalle de un vehículo: se ven datos e imágenes; botón **Eliminar vehículo** visible y funcional si aplica.
- [ ] **Leads – Contacto:** se listan los mensajes enviados desde el formulario de la web; se pueden marcar estado y notas.
- [ ] **Leads – Test drive:** se listan las solicitudes de prueba; se pueden marcar estado y notas.
- [ ] **Escenas / Garaje:** se pueden ver y gestionar las escenas (imagen de escena y puntos clicables).
- [ ] Cerrar sesión o refrescar: el login vuelve a pedir credenciales.

### API (si se dispone de URL del backend)

- [ ] `GET /api/health` → 200 y cuerpo con `"ok": true`.
- [ ] `POST /api/auth/login` con `{"username":"admin","password":"admin"}` → 200 y token.
- [ ] `GET /api/vehicles` → 200 y lista de vehículos.

---

## 4. Notas para QA

- **Navegador:** Probar en Chrome/Edge y, si es posible, en Safari o Firefox.
- **Móvil:** Comprobar que la web y el panel se usan bien en pantalla pequeña.
- **Leads:** Los envíos desde la web deben verse en el panel en **Leads → Contacto** y **Leads → Test drive**.
- **Imágenes:** Si alguna imagen no carga, puede ser CORS o red; anotar URL y pantalla para reportar.
- **Túneles:** Las URLs son temporales; si caducan o cambian, solicitar nuevas al equipo.

---

## 5. Resumen

| Componente | URL | Uso |
|------------|-----|-----|
| **Web** | https://backup-vintage-javascript-defined.trycloudflare.com/ | Pruebas de usuario final |
| **Panel** | https://which-debug-miracle-cam.trycloudflare.com/ | Pruebas de administración (admin/admin) |
| **API** | https://circulation-flex-wallpapers-locking.trycloudflare.com/ | Pruebas técnicas de endpoints |

---

*Documento generado para entrega a QA. Actualizar las URLs si se regeneran los túneles.*
