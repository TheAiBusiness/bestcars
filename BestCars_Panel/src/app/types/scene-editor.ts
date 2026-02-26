export type PositionId =
  | "parking-1"
  | "parking-2"
  | "parking-3"
  | "rampa"
  | "parking-4";

export type Transform = {
  /**
   * Desplazamiento en px relativo al centro del lienzo.
   * (0,0) = centrado.
   */
  x: number;
  y: number;
  /** 1 = 100% */
  scale: number;
  /** Grados */
  rotation: number;
};

export type SceneSlot = {
  vehicleId: string | null;
  transform: Transform;
  updatedAt: string;
};

export type Scene = {
  id: string;
  name: string;
  backgroundUrl: string;
  positions: Record<PositionId, SceneSlot>;
  createdAt: string;
  updatedAt: string;
};

export type SceneEditorStorage = {
  scenes: Scene[];
  activeSceneId: string;
  activePositionId: PositionId;
  previewUrl: string;
  /** ID de la escena que está proyectada en la web (bloqueada / visible para el usuario) */
  webActiveSceneId: string | null;
};

export const POSITION_ORDER: PositionId[] = [
  "parking-1",
  "parking-2",
  "parking-3",
  "rampa",
  "parking-4",
];

export const POSITION_LABEL: Record<PositionId, string> = {
  "parking-1": "Parking 1",
  "parking-2": "Parking 2",
  "parking-3": "Parking 3",
  rampa: "Rampa",
  "parking-4": "Parking 4",
};

export function createEmptySlot(): SceneSlot {
  const now = new Date().toISOString();
  return {
    vehicleId: null,
    transform: { x: 0, y: 0, scale: 1, rotation: 0 },
    updatedAt: now,
  };
}

export function createEmptyScene(params: {
  name: string;
  backgroundUrl: string;
}): Scene {
  const now = new Date().toISOString();
  return {
    id: `scene_${Date.now()}`,
    name: params.name,
    backgroundUrl: params.backgroundUrl,
    positions: {
      "parking-1": createEmptySlot(),
      "parking-2": createEmptySlot(),
      "parking-3": createEmptySlot(),
      rampa: createEmptySlot(),
      "parking-4": createEmptySlot(),
    },
    createdAt: now,
    updatedAt: now,
  };
}
