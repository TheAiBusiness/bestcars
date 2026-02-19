# Best Cars Ibérica - Frontend

Aplicación web para la concesionaria Best Cars Ibérica. Catálogo de vehículos de lujo con galería de imágenes, formulario de contacto y diseño responsive.

## Mejoras profesionales incluidas

- **SEO**: Meta tags Open Graph, Twitter Cards, título dinámico por vehículo
- **Rendimiento**: Lazy loading de rutas, imágenes con `loading="lazy"`
- **UX**: Skeleton loading en detalle de vehículo, breadcrumbs de navegación
- **Footer**: Enlaces, contacto y redes sociales
- **Accesibilidad**: Favicon PNG, estructura semántica

## Tecnologías

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **Motion** - Animaciones
- **Sonner** - Notificaciones toast

## Requisitos previos

- Node.js 18+
- npm o pnpm

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno (opcional)
cp .env.example .env
```

## Variables de entorno

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `VITE_API_URL` | URL base del API backend | `http://localhost:3001` |

## Scripts

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Linter
npm run lint
npm run lint:fix
```

## Estructura del proyecto

```
src/
├── app/
│   ├── components/     # Componentes reutilizables
│   └── pages/          # Páginas de la aplicación
├── assets/             # Imágenes y recursos estáticos
├── services/           # Llamadas a la API
├── types/              # Tipos TypeScript
├── utils/              # Utilidades
└── styles/             # Estilos globales
```

## Rutas

- `/` - Página de inicio (imagen de la casa con hotspots)
- `/garage` - Vista del garaje con stock
- `/vehicle/:id` - Detalle de vehículo
- `*` - Página 404

## Optimización de imágenes

El proyecto incluye `vite-plugin-image-optimizer` con Sharp y SVGO para comprimir imágenes en el build. Las imágenes grandes (home, garaje) se optimizan automáticamente reduciendo el tamaño del bundle.

## Integración con el backend

Este frontend se conecta al API en **Bestcars_Back_DEF**. Configura `VITE_API_URL` en `.env`:

```env
VITE_API_URL=http://localhost:3001
```

**Sin backend:** Los hotspots de la home muestran fallback (car-1 a car-5). El Stock y los formularios fallarán.

**Con backend:** Inicia el backend (`cd Bestcars_Back_DEF && npm run dev`) antes del frontend.

## Licencia

Privado - Best Cars Ibérica S.L.
