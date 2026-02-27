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
    id: `scene_${Date.now()}`,
    name: params.name,
    backgroundUrl: params.backgroundUrl,
    hotspots: params.hotspots ?? [],
    createdAt: now,
    updatedAt: now,
  };
}
