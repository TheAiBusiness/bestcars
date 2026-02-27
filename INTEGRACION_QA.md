# Integración final: Web + Panel + Backend (escena 2)

- **Home no se modifica:** hotspots de Home siguen igual (CarHotspots + escena activa).
- **Escena 2** se prueba por ruta `/escena?index=1` o desde Home con el botón "Siguiente escena".

---

## Lista de archivos tocados (por ámbito)

### Web (Bestcars_front_DEF)
| Archivo | Rol |
|---------|-----|
| `src/app/App.tsx` | Ruta `/escena` → DynamicScenePage. |
| `src/app/components/NextSceneButton.tsx` | Botón "Siguiente escena" enlaza a `/escena?index={siguiente}`. |
| `src/app/pages/DynamicScenePage.tsx` | Página escena 2+: background + hotspots desde API; fallback si no hay escena. |
| `src/app/pages/DynamicScenePage.css` | Estilos de la página de escena dinámica. |
| `src/app/pages/GaragePage.tsx` | Fondo por `backgroundUrl`; escena por defecto = activa; navegación entre escenas. |
| `src/app/pages/ScenePreviewPage.tsx` | Fondo por `scene.backgroundUrl` con fallback. |
| `src/app/components/SceneHotspots.tsx` | Hotspots en escena 2 / garage (no usado en Home). |

**No tocados (Home intacto):** `HomePage.tsx`, `CarHotspots.tsx`, `CarHotspots.css`, `api.ts` (contrato de `sceneHotspots` sin cambios para Home).

### Panel (BestCars_Panel)
| Archivo | Rol |
|---------|-----|
| `src/hooks/useSceneEditorApi.ts` | Carga escenas desde API; `persistScene` (crear/actualizar) devuelve `sceneId`; `setActiveSceneApi` con `silentSuccess`. |
| `src/app/components/scene-editor-section.tsx` | Crear escena (nombre + background_url), añadir hotspots ilimitados, "Guardar y publicar" (guardar + activar, un solo toast). |

### Backend (Bestcars_Back_DEF)
| Archivo | Rol |
|---------|-----|
| `prisma/schema.prisma` | Modelo Scene: id, name, background_url, positions (JSON hotspots), isActive, order. |
| `src/controllers/sceneController.ts` | GET/POST/PATCH/DELETE escenas; PATCH activate; solo 1 activa; respuestas con `hotspots[]`. |
| `src/utils/sceneNormalize.ts` | Normalización a `hotspots[]` (id, vehicleId, x, y, createdAt?, label?). |
| `src/routes/sceneRoutes.ts` | Rutas escenas (sin tocar vehículos/leads). |

---

## Comportamiento verificado

- **Escena 2 en web:** Muestra `backgroundUrl` de la escena y hotspots guardados (SceneHotspots).
- **Panel:** Crear escena (nombre + URL fondo), añadir hotspots ilimitados antes de guardar; "Guardar y publicar" persiste y deja la escena activa.
- **Navegación:** Home → "Siguiente escena" → `/escena?index=1` (escena 2).
- **Sin escena activa / sin escenas:** En `/escena` se muestra "No hay escena disponible." + enlace "Volver al inicio" (no se redirige a Garage).

---

## Pasos exactos de QA

1. **Crear escena en el panel**  
   - Entrar al panel, ir al editor de escenas.  
   - Rellenar "Nueva escena": nombre (ej. "Garaje 2") y URL de fondo (opcional).  
   - Pulsar "Nueva escena". Comprobar que la escena aparece en la lista y se puede seleccionar.

2. **Añadir 3 hotspots seguidos**  
   - Seleccionar un vehículo en el desplegable.  
   - Activar "Añadir hotspot".  
   - Hacer 3 clics en el canvas (en distintas posiciones).  
   - Comprobar que aparecen 3 hotspots y que se pueden arrastrar y editar (cambiar vehículo, centrar, eliminar).

3. **Guardar y publicar**  
   - Pulsar "Guardar y publicar".  
   - Comprobar un solo toast "Guardado y publicado" y que el estado pasa a "Guardado ✓".  
   - Comprobar que la escena queda marcada como activa en la web (si el panel lo indica).

4. **Abrir Home y pulsar "Siguiente escena"**  
   - En la web pública, ir a la Home.  
   - Comprobar que aparece el botón "Siguiente escena" (o "Escena 2" / "Ver otra escena").  
   - Pulsarlo.

5. **Ver escena 2 con hotspots correctos**  
   - Debe cargarse la página de escena 2 con el fondo configurado.  
   - Debe verse los 3 hotspots en las posiciones guardadas.  
   - Clic en cada hotspot debe llevar al detalle del vehículo correcto.  
   - "Volver al inicio" debe llevar de vuelta a Home.

---

## Casos adicionales (opcional)

- **Sin escenas:** En `/escena` o `/escena?index=1` sin datos en backend → mensaje "No hay escena disponible." y enlace a inicio.  
- **Recargar panel:** Tras guardar, recargar el panel y comprobar que la escena y los hotspots siguen (desde DB).  
- **Home sin tocar:** Verificar que en Home los hotspots siguen siendo los de la escena activa y que no se ha cambiado lógica de CarHotspots.
