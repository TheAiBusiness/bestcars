/**
 * Normalización de escenas para API y persistencia.
 * Garantiza siempre el shape:
 * {
 *   id: string;
 *   name: string;
 *   backgroundUrl: string;
 *   hotspots: { id, vehicleId, x, y, createdAt? }[]
 * }
 *
 * Admite:
 * - input.hotspots: array de hotspots (nuevo modelo)
 * - input.positions: objeto legacy por slotId
 * - input.positions: array de hotspots (por compatibilidad)
 */

export interface NormalizedHotspot {
  id: string;
  vehicleId: string;
  x: number;
  y: number;
  createdAt?: string;
  label?: string;
}

export interface NormalizedScene {
  id: string;
  name: string;
  backgroundUrl: string;
  hotspots: NormalizedHotspot[];
}

function generateHotspotId(): string {
  return `hs_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

type LegacyPosition = {
  vehicleId?: string | null;
  transform?: { x?: number; y?: number; scale?: number; rotation?: number };
  updatedAt?: string;
};

/**
 * Normaliza una escena cualquiera (DB, mock, payload) a modelo final con hotspots[].
 */
export function normalizeScene(input: any): NormalizedScene {
  const raw = input ?? {};

  const id =
    typeof raw.id === 'string'
      ? raw.id
      : raw.id != null
        ? String(raw.id)
        : '';

  const name =
    typeof raw.name === 'string' && raw.name.trim()
      ? raw.name.trim()
      : 'Escena';

  const backgroundUrl =
    typeof raw.backgroundUrl === 'string' ? raw.backgroundUrl : '';

  const hotspots: NormalizedHotspot[] = [];

  const pushFromArray = (arr: unknown[]) => {
    for (const item of arr) {
      if (!item || typeof item !== 'object') continue;
      const h = item as Partial<NormalizedHotspot>;
      if (!h.vehicleId) continue;
      const vehicleId = String(h.vehicleId);
      const x = Number((h as any).x);
      const y = Number((h as any).y);
      const out: NormalizedHotspot = {
        id: typeof h.id === 'string' && h.id ? h.id : generateHotspotId(),
        vehicleId,
        x: Number.isFinite(x) ? x : 0,
        y: Number.isFinite(y) ? y : 0,
        createdAt: typeof h.createdAt === 'string' ? h.createdAt : undefined,
      };
      if (typeof (h as any).label === 'string') out.label = (h as any).label;
      hotspots.push(out);
    }
  };

  if (Array.isArray(raw.hotspots)) {
    pushFromArray(raw.hotspots);
  } else if (Array.isArray(raw.positions)) {
    // Compat: positions ya como array de hotspots
    pushFromArray(raw.positions);
  } else if (raw.positions && typeof raw.positions === 'object') {
    // Legacy: objeto por slotId
    const positions = raw.positions as Record<string, LegacyPosition>;
    for (const [slotId, slot] of Object.entries(positions)) {
      if (!slot?.vehicleId) continue;
      const vehicleId = String(slot.vehicleId);
      const t = slot.transform ?? {};
      const x = Number(t.x);
      const y = Number(t.y);
      hotspots.push({
        id: `legacy-${slotId}-${vehicleId}`,
        vehicleId,
        x: Number.isFinite(x) ? x : 0,
        y: Number.isFinite(y) ? y : 0,
        createdAt: slot.updatedAt,
      });
    }
  }

  return {
    id,
    name,
    backgroundUrl,
    hotspots,
  };
}

export function normalizeScenes(list: any[]): NormalizedScene[] {
  if (!Array.isArray(list)) return [];
  return list.map((item) => normalizeScene(item));
}

