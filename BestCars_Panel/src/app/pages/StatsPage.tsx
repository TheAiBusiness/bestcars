import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { usePanelDataContext } from "../../contexts/PanelDataContext";
import { StatsSection } from "../components/stats-section";

export default function StatsPage() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const { vehicles } = usePanelDataContext();

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredVehicles = useMemo(() => {
    if (!normalizedQuery) return vehicles;
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(normalizedQuery) ||
        v.brand.toLowerCase().includes(normalizedQuery) ||
        v.model.toLowerCase().includes(normalizedQuery)
    );
  }, [vehicles, normalizedQuery]);

  return <StatsSection vehicles={filteredVehicles} />;
}
