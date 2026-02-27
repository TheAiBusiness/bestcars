/** Un hotspot: punto clicable en la escena asociado a un vehículo. x,y en px respecto al centro. */
export type Hotspot = {
  id: string;
  vehicleId: string;
  x: number;
  y: number;
  createdAt?: string;
};

export type Scene = {
  id: string;
  name: string;
  backgroundUrl: string;
  hotspots: Hotspot[];
  createdAt: string;
  updatedAt: string;
};

export type SceneEditorStorage = {
  scenes: Scene[];
  activeSceneId: string;
  /** ID del hotspot seleccionado en el editor (null = ninguno) */
  activeHotspotId: string | null;
  previewUrl: string;
  /** ID de la escena proyectada en la web (bloqueada) */
  webActiveSceneId: string | null;
};

export function generateHotspotId(): string {
  return `hs_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyScene(params: {
  name: string;
  backgroundUrl: string;
  hotspots?: Hotspot[];
}): Scene {
  const now = new Date().toISOString();
  return {
    id: `scene_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name: params.name,
    backgroundUrl: params.backgroundUrl,
    hotspots: params.hotspots ?? [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Formato legacy: positions por nombre de slot */
type LegacyPosition = {
  vehicleId?: string | null;
  transform?: { x?: number; y?: number; scale?: number; rotation?: number };
  updatedAt?: string;
};
type LegacyPositions = Record<string, LegacyPosition>;

function nowIso(): string {
  return new Date().toISOString();
}

function migrateScene(sceneRaw: unknown, fallbackScene: Scene): Scene {
  if (!sceneRaw || typeof sceneRaw !== "object") return fallbackScene;
  const s = sceneRaw as Record<string, unknown>;
  const id = typeof s.id === "string" ? s.id : fallbackScene.id;
  const name = typeof s.name === "string" ? s.name : fallbackScene.name;
  const backgroundUrl = typeof s.backgroundUrl === "string" ? s.backgroundUrl : fallbackScene.backgroundUrl;
  const createdAt = typeof s.createdAt === "string" ? s.createdAt : nowIso();
  const updatedAt = typeof s.updatedAt === "string" ? s.updatedAt : nowIso();

  let hotspots: Hotspot[] = [];
  if (Array.isArray(s.hotspots)) {
    hotspots = (s.hotspots as unknown[]).filter(
      (h): h is Hotspot =>
        h != null &&
        typeof (h as Hotspot).id === "string" &&
        typeof (h as Hotspot).vehicleId === "string" &&
        typeof (h as Hotspot).x === "number" &&
        typeof (h as Hotspot).y === "number"
    ).map((h) => ({
      id: (h as Hotspot).id,
      vehicleId: (h as Hotspot).vehicleId,
      x: Number((h as Hotspot).x) || 0,
      y: Number((h as Hotspot).y) || 0,
      createdAt: (h as Hotspot).createdAt,
    }));
  } else if (s.positions != null && typeof s.positions === "object" && !Array.isArray(s.positions)) {
    const positions = s.positions as LegacyPositions;
    for (const [slotId, slot] of Object.entries(positions)) {
      if (!slot?.vehicleId) continue;
      const t = slot.transform ?? {};
      hotspots.push({
        id: generateHotspotId(),
        vehicleId: String(slot.vehicleId),
        x: Number(t.x) ?? 0,
        y: Number(t.y) ?? 0,
        createdAt: slot.updatedAt,
      });
    }
  }

  return {
    id,
    name,
    backgroundUrl,
    hotspots,
    createdAt,
    updatedAt,
  };
}

/**
 * Migra/valida el estado del editor de escenas desde localStorage.
 * Convierte formato legacy (positions) a hotspots[] y asegura estructura válida.
 */
export function migrateSceneEditorStorage(
  raw: unknown,
  fallback: SceneEditorStorage
): SceneEditorStorage {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;

  let scenes: Scene[] = fallback.scenes;
  if (Array.isArray(o.scenes)) {
    const fallbackScene = fallback.scenes[0] ?? createEmptyScene({ name: "Escena 1", backgroundUrl: "" });
    scenes = (o.scenes as unknown[]).map((item, i) =>
      migrateScene(item, fallback.scenes[i] ?? fallbackScene)
    );
    if (scenes.length === 0) scenes = [createEmptyScene({ name: "Escena 1", backgroundUrl: "" })];
  }

  let activeSceneId = typeof o.activeSceneId === "string" ? o.activeSceneId : fallback.activeSceneId;
  if (!scenes.some((s) => s.id === activeSceneId)) {
    activeSceneId = scenes[0]?.id ?? fallback.activeSceneId;
  }

  const activeScene = scenes.find((s) => s.id === activeSceneId);
  let activeHotspotId: string | null = null;
  if (typeof o.activeHotspotId === "string" && activeScene) {
    const hasHotspot = Array.isArray(activeScene.hotspots) && activeScene.hotspots.some((h) => h.id === o.activeHotspotId);
    if (hasHotspot) activeHotspotId = o.activeHotspotId as string;
  }

  const previewUrl = typeof o.previewUrl === "string" ? o.previewUrl : fallback.previewUrl;
  const webActiveSceneId =
    o.webActiveSceneId === null || typeof o.webActiveSceneId === "string"
      ? (o.webActiveSceneId as string | null)
      : null;

  return {
    scenes,
    activeSceneId,
    activeHotspotId,
    previewUrl,
    webActiveSceneId,
  };
}
