# Lighthouse Audit — Auditoría SEO y Rendimiento

Script para medir automáticamente las métricas de rendimiento y SEO de la web en producción.

## Uso

```bash
npm run seo:audit
```

## Requisitos

- **Chrome o Chromium** instalado en el sistema (Lighthouse lo usa en modo headless).
- Si Chrome no se detecta automáticamente:
  - Windows: instala [Chrome](https://www.google.com/chrome/) o [Chromium](https://www.chromium.org/).
  - O define `CHROME_PATH` / `PUPPETEER_EXECUTABLE_PATH` con la ruta al ejecutable.

## URLs auditadas

1. `https://bestcarsiberica.com/` (Home)
2. `https://bestcarsiberica.com/garage`
3. `https://bestcarsiberica.com/experiencia`
4. Una ficha de vehículo (ID obtenido del sitemap.xml)

Si el sitemap no está disponible (red restringida, etc.), puedes forzar un ID:

```bash
LIGHTHOUSE_FALLBACK_VEHICLE_ID=abc123 npm run seo:audit
```

## Salida

- **Consola:** Tabla con puntuaciones (Performance, Accessibility, Best Practices, SEO).
- **Recomendaciones:** Si alguna métrica está por debajo de 90, se listan las sugerencias de Lighthouse.
- **JSON:** Informe completo en `reports/lighthouse-audit-{timestamp}.json`.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `CHROME_PATH` | Ruta al ejecutable de Chrome/Chromium |
| `PUPPETEER_EXECUTABLE_PATH` | Alternativa (usa el Chromium de Puppeteer si está instalado) |
| `LIGHTHOUSE_FALLBACK_VEHICLE_ID` | ID de vehículo si el sitemap no está accesible |

## Ejemplo de salida

```
Lighthouse Audit — BestCars Ibérica
====================================

Vehículo detectado en sitemap: /vehicle/abc123

[1/4] Auditando: https://bestcarsiberica.com/
[2/4] Auditando: https://bestcarsiberica.com/garage
[3/4] Auditando: https://bestcarsiberica.com/experiencia
[4/4] Auditando: https://bestcarsiberica.com/vehicle/abc123

--------------------------------------------------+--------+--------+--------+-------
URL                                                | Perf   | A11y   | BP     | SEO
--------------------------------------------------+--------+--------+--------+-------
https://bestcarsiberica.com/                       |   78   |   92   |  100   |   95
https://bestcarsiberica.com/garage                 |   82   |   94   |  100   |   96
https://bestcarsiberica.com/experiencia            |   85   |   91   |  100   |   93
https://bestcarsiberica.com/vehicle/abc123         |   88   |   95   |  100   |   98
--------------------------------------------------+--------+--------+--------+-------
MEDIA                                              |   83 |   93 |  100 |   95
--------------------------------------------------+--------+--------+--------+-------

--- RECOMENDACIONES (métricas < 90) ---

[PERFORMANCE] Reduce unused JavaScript — 420 KiB
  URL: https://bestcarsiberica.com/
  Reduce unused JavaScript and defer loading it until it's required to decrease bytes consumed by network activity...

[PERFORMANCE] Properly size images — 1.2 MiB
  URL: https://bestcarsiberica.com/
  Serve images that are appropriately-sized to save cellular data and improve load time...

Informe JSON guardado: reports/lighthouse-audit-1730654321000.json
```
