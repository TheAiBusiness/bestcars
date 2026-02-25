# Checklist deploy — imprimir o tener a mano

## Antes del build

- [ ] Backend: `.env` creado desde `.env.example` o `.env.production.example`
- [ ] Backend: `NODE_ENV=production`, `CORS_ORIGINS` con tus dominios reales
- [ ] Backend: `ADMIN_PASSWORD` y `JWT_SECRET` **cambiados** (no dejar admin/admin)
- [ ] Web: `.env` con `VITE_API_URL=https://tu-api-url`
- [ ] Panel: `.env` con `VITE_API_URL=https://tu-api-url`
- [ ] Si usas BD (Back-updated): `DATABASE_URL` y `npm run db:push` / `db:seed`

## Build

- [ ] `npm run build` en el backend que uses (Back_DEF o Back-updated)
- [ ] `npm run build` en Bestcars_front_DEF
- [ ] `npm run build` en BestCars_Panel  
  **O** desde la raíz: `.\build-all.ps1` (Windows) / `./build-all.sh` (Mac/Linux)

## Después del deploy

- [ ] API responde: `GET https://tu-api-url/api/health`
- [ ] Web carga y muestra vehículos
- [ ] Panel: login con usuario/contraseña de producción
- [ ] Formularios contacto y test drive envían
- [ ] Credenciales del panel anotadas y entregadas al cliente

---

**Guía completa:** [DEPLOY.md](./DEPLOY.md)
