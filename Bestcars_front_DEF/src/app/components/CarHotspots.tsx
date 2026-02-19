import React, { useEffect, useState } from "react";
import "./CarHotspots.css";
import { Link } from "react-router-dom";
import { api } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";

interface CarHotspot {
  id: string;
  vehicleId: string;
  vehicleName: string;
  position: { top: string; left: string };
}

// Position mapping - could be stored in DB later
// Maps vehicle ID to position on the image (16:9 aspect ratio - Bestcars-home.png)
const positionMap: Record<string, { top: string; left: string }> = {
  "car-1": { top: "40%", left: "15%" },
  "car-2": { top: "35%", left: "24%" },
  "car-3": { top: "75%", left: "42%" },
  "car-4": { top: "30%", left: "31.5%" },
  "car-5": { top: "68%", left: "72%" },
};

// Default positions for vehicles without specific mapping
const defaultPositions = [
  { top: "30%", left: "25%" },
  { top: "50%", left: "40%" },
  { top: "70%", left: "55%" },
  { top: "25%", left: "60%" },
  { top: "60%", left: "20%" },
];

export default function CarHotspots() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await api.getAllVehicles();
        // Show all vehicles on home page
        setVehicles(data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        // Fallback to known vehicle IDs if API fails
        // This ensures hotspots still show even if backend is down
        setVehicles([
          { id: 'car-1' } as Vehicle,
          { id: 'car-2' } as Vehicle,
          { id: 'car-3' } as Vehicle,
          { id: 'car-4' } as Vehicle,
          { id: 'car-5' } as Vehicle,
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Create hotspots from vehicles (or fallback to known IDs)
  const carHotspots: CarHotspot[] = vehicles.length > 0
    ? vehicles.map((vehicle, index) => ({
        id: vehicle.id,
        vehicleId: vehicle.id,
        vehicleName: vehicle.title ?? vehicle.id,
        position: positionMap[vehicle.id] || defaultPositions[index % defaultPositions.length],
      }))
    : // Fallback: show hotspots for known vehicle IDs if API fails
      Object.keys(positionMap).map((id) => ({
        id,
        vehicleId: id,
        vehicleName: id,
        position: positionMap[id],
      }));

  if (carHotspots.length === 0) {
    return null;
  }

  return (
    <div className="car-hotspots">
      {carHotspots.map((hotspot, index) => (
        <Link
          key={hotspot.id}
          to={`/vehicle/${hotspot.vehicleId}`}
          className="car-hotspot"
          style={{
            top: hotspot.position.top,
            left: hotspot.position.left,
            animationDelay: `${index * 0.15}s`,
          }}
          aria-label={hotspot.vehicleName}
        >
          <span className="hotspot-label" aria-hidden="true">{hotspot.vehicleName}</span>
          <span className="hotspot-dot"></span>
          <span className="hotspot-ring"></span>
        </Link>
      ))}
    </div>
  );
}
