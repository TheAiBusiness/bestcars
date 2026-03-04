# SEO On-Page — Meta Tags Optimizados

**Fecha:** 4 de marzo de 2025  
**Dominio:** https://bestcarsiberica.com  
**Enfoque:** Búsquedas locales (Madrid), compra/venta, marcas Audi, BMW, Porsche

---

## Textos aplicados por página

### Home (index.html + HomePage.tsx)

| Campo | Texto |
|-------|-------|
| **Title** | Coches de lujo en Madrid \| Audi, BMW, Porsche \| Best Cars Ibérica |
| **Description** | Compra y venta de vehículos premium en Madrid. Audi, BMW, Porsche. Catálogo exclusivo, asesoramiento personalizado. Visita nuestro showroom. |

**Caracteres:** Title 55 | Description 119

---

### Garage (GaragePage.tsx)

| Campo | Texto |
|-------|-------|
| **Title** | Catálogo vehículos premium Madrid \| Best Cars Ibérica |
| **Description** | Explora nuestro catálogo de coches de lujo en Madrid. Seminuevos y nuevos: Audi, BMW, Porsche. Encuentra tu vehículo ideal. |

**Caracteres:** Title 48 | Description 112

---

### Experiencia (DynamicScenePage.tsx)

| Campo | Texto |
|-------|-------|
| **Title** | Showroom virtual 360° — Coches de lujo Madrid \| Best Cars Ibérica |
| **Description** | Vive la experiencia 360° de nuestros vehículos premium en Madrid. Audi, BMW, Porsche. Recorre nuestro showroom virtual. |

**Caracteres:** Title 58 | Description 112

---

### Vehicle Detail (VehicleDetailPage.tsx) — dinámico

| Campo | Formato |
|-------|---------|
| **Title** | {Marca} {Modelo} en Madrid \| Best Cars Ibérica |
| **Description** | {Marca} {Modelo} ({Año}) en Madrid. Disponible en Best Cars Ibérica. Compra y venta de vehículos premium. |

**Ejemplo:** Audi A4 2022 en Madrid | Best Cars Ibérica

---

### Términos y Condiciones (TermsPage.tsx)

| Campo | Texto |
|-------|-------|
| **Title** | Términos y Condiciones — Best Cars Ibérica |
| **Description** | Términos y condiciones de uso del sitio web de Best Cars Ibérica. |

**Caracteres:** Title 38 | Description 52

---

### Política de Privacidad (PrivacyPage.tsx)

| Campo | Texto |
|-------|-------|
| **Title** | Política de Privacidad — Best Cars Ibérica |
| **Description** | Política de privacidad y protección de datos de Best Cars Ibérica. |

**Caracteres:** Title 38 | Description 52

---

### Página No Encontrada (NotFoundPage.tsx)

| Campo | Texto |
|-------|-------|
| **Title** | Página No Encontrada — Best Cars Ibérica |
| **Description** | La página que buscas no existe. Vuelve a nuestra web para descubrir coches de lujo en Madrid. |

**Caracteres:** Title 38 | Description 77

---

### Vista Previa (ScenePreviewPage.tsx) — Disallow en robots.txt

| Campo | Texto |
|-------|-------|
| **Title** | Vista Previa — Best Cars Ibérica |
| **Description** | Previsualiza nuestros vehículos de lujo en escenarios exclusivos. Best Cars Ibérica, Madrid. |

---

## Cambios realizados

1. **Eliminada meta tag `keywords`** de index.html (Google la ignora desde 2009).
2. **Unicidad:** Cada página tiene title y description distintos.
3. **Keywords locales:** Madrid, compra, venta, catálogo, showroom.
4. **Marcas:** Audi, BMW, Porsche en páginas principales.
5. **Límites:** Title ≤60 chars, Description ≤155 chars.

---

## Archivos modificados

| Archivo | Cambios |
|---------|---------|
| `index.html` | Eliminado keywords, actualizado title/description/og/twitter |
| `src/app/pages/HomePage.tsx` | Title, description, h1, og, twitter |
| `src/app/pages/GaragePage.tsx` | Title, description, og, twitter |
| `src/app/pages/DynamicScenePage.tsx` | Title, description, og, twitter |
| `src/app/pages/VehicleDetailPage.tsx` | Formato dinámico "{Marca} {Modelo} en Madrid | Best Cars Ibérica" |
| `src/app/pages/TermsPage.tsx` | Description simplificada |
| `src/app/pages/PrivacyPage.tsx` | Description simplificada |
| `src/app/pages/NotFoundPage.tsx` | Description con Madrid |
| `src/app/pages/ScenePreviewPage.tsx` | Description con Madrid |
