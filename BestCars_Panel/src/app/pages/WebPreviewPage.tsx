import { useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { usePanelDataContext } from "../../contexts/PanelDataContext";
import { WebPreviewSection } from "../components/web-preview-section";
import { WebPreviewModal } from "../components/web-preview-modal";
import { Vehicle } from "../data/mock-data";

export default function WebPreviewPage() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const { vehicles, loading } = usePanelDataContext();
  const [isWebPreviewOpen, setIsWebPreviewOpen] = useState(false);
  const [previewVehicle, setPreviewVehicle] = useState<Vehicle | null>(null);

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

  const handleWebPreview = useCallback((vehicle: Vehicle) => {
    setPreviewVehicle(vehicle);
    setIsWebPreviewOpen(true);
  }, []);

  if (loading) return null;

  return (
    <>
      <WebPreviewSection
        vehicles={filteredVehicles}
        onVehiclePreview={handleWebPreview}
      />
      <WebPreviewModal
        isOpen={isWebPreviewOpen}
        onClose={() => setIsWebPreviewOpen(false)}
        vehicle={previewVehicle}
      />
    </>
  );
}
