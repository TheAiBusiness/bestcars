# Túneles Cloudflare para probar en local con URLs públicas

Expone tu backend, web y panel (ya corriendo en local) con URLs públicas tipo `https://xxx.trycloudflare.com` para probar desde el móvil, compartir o simular producción.

## Requisitos

1. **cloudflared** instalado:
   - Windows: `winget install Cloudflare.cloudflared`
   - O descarga: [Cloudflare Tunnel - Downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
2. Backend, web y panel **ya en ejecución** en tu PC (puertos 3001, 5173, 5174).

## Uso

1. Arranca los tres servicios en local (por ejemplo con tres terminales):

   ```powershell
   # Terminal 1 - Backend
   cd Bestcars_Back_DEF
   npm run dev

   # Terminal 2 - Web
   cd Bestcars_front_DEF
   npm run dev

   # Terminal 3 - Panel
   cd BestCars_Panel
   npm run dev
   ```

2. Desde la **raíz del proyecto**, ejecuta el script de túneles:

   ```powershell
   .\run-tunnels-cloudflare.ps1
   ```

3. Se abrirán **3 ventanas**. En cada una, cloudflared mostrará una URL pública (ej: `https://abc123.trycloudflare.com`). Anota:
   - URL del **backend**
   - URL de la **web**
   - URL del **panel**

## Para que login e imágenes funcionen con las URLs del túnel

- **CORS:** En `Bestcars_Back_DEF\.env` pon en `CORS_ORIGINS` las URLs de la web y del panel (las que te dio cloudflared), separadas por coma. Reinicia el backend.
- **API en front:** Si quieres que la web y el panel usen el backend por túnel (por ejemplo para probar desde el móvil), en `Bestcars_front_DEF\.env` y `BestCars_Panel\.env` define `VITE_API_URL` con la URL del túnel del backend (ej: `https://xyz.trycloudflare.com`) y reinicia los dev servers de web y panel.

Cada vez que cierres y vuelvas a ejecutar `run-tunnels-cloudflare.ps1`, las URLs cambiarán; tendrás que actualizar `CORS_ORIGINS` y `VITE_API_URL` si las usas.
