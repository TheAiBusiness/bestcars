# Comandos exactos – Git Bash (arranque + URLs Cloudflare)

Abre Git Bash en la carpeta del proyecto (o `cd` hasta ella):

```bash
cd "/c/Users/alext/OneDrive/Documentos/The Ai business/Bestcars back/Bestcars_panelDef"
```

---

## Terminal 1 – Backend

```bash
cd "/c/Users/alext/OneDrive/Documentos/The Ai business/Bestcars back/Bestcars_panelDef/Bestcars_Back_DEF" && npm run dev
```

Dejar abierta. Debe salir algo como: `Server running on http://localhost:3001`

---

## Terminal 2 – Web

```bash
cd "/c/Users/alext/OneDrive/Documentos/The Ai business/Bestcars back/Bestcars_panelDef/Bestcars_front_DEF" && npm run dev
```

Dejar abierta. Vite usará el puerto 5173 (u otro si está ocupado).

---

## Terminal 3 – Panel

```bash
cd "/c/Users/alext/OneDrive/Documentos/The Ai business/Bestcars back/Bestcars_panelDef/BestCars_Panel" && npm run dev
```

Dejar abierta. Puerto 5174 (u otro si está ocupado).

---

## Terminal 4 – Túneles Cloudflare (URLs para QA)

```bash
cd "/c/Users/alext/OneDrive/Documentos/The Ai business/Bestcars back/Bestcars_panelDef" && chmod +x run-tunnels-cloudflare.sh && ./run-tunnels-cloudflare.sh
```

Se mostrarán las 3 URLs (Web, Panel, API) y se guardarán en `URLS_QA_ACTUAL.txt`. No cierres esta ventana mientras QA esté probando.

---

## Resumen (copiar/pegar en orden)

**Terminal 1:**
```bash
cd "/c/Users/alext/OneDrive/Documentos/The Ai business/Bestcars back/Bestcars_panelDef/Bestcars_Back_DEF" && npm run dev
```

**Terminal 2:**
```bash
cd "/c/Users/alext/OneDrive/Documentos/The Ai business/Bestcars back/Bestcars_panelDef/Bestcars_front_DEF" && npm run dev
```

**Terminal 3:**
```bash
cd "/c/Users/alext/OneDrive/Documentos/The Ai business/Bestcars back/Bestcars_panelDef/BestCars_Panel" && npm run dev
```

**Terminal 4 (URLs Cloudflare):**
```bash
cd "/c/Users/alext/OneDrive/Documentos/The Ai business/Bestcars back/Bestcars_panelDef" && ./run-tunnels-cloudflare.sh
```

Panel: usuario **admin**, contraseña **admin**.
