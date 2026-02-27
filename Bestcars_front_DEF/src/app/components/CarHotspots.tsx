import React from "react";
import "./CarHotspots.css";
import { Link } from "react-router-dom";
import type { Vehicle } from "../../types/vehicle.js";
import type { Hotspot } from "../../services/api.js";

interface CarHotspotsProps {
  hotspots: Hotspot[];
  vehicles: Vehicle[];
}

export default function CarHotspots({ hotspots, vehicles }: CarHotspotsProps) {
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  if (safeHotspots.length === 0) return null;

  return (
    <div className="car-hotspots">
      {safeHotspots.map((h, index) => {
        const vehicle = vehicleMap.get(h.vehicleId);
        if (!vehicle) return null;
        const label = vehicle.title ?? vehicle.id;
        return (
          <Link
            key={h.id}
            to={`/vehicle/${vehicle.id}`}
            className="car-hotspot"
            style={{
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) translate(${h.x}px, ${h.y}px)`,
              animationDelay: `${index * 0.15}s`,
            }}
            aria-label={label}
          >
            <span className="hotspot-label" aria-hidden="true">
              {label}
            </span>
            <span className="hotspot-dot"></span>
            <span className="hotspot-ring"></span>
          </Link>
        );
      })}
    </div>
  );
}
