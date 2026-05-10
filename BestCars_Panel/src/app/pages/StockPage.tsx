import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useOutletContext } from "react-router-dom";
import { usePanelDataContext } from "../../contexts/PanelDataContext";
import { StockSection } from "../components/stock-section";
import { VehicleDetail } from "../components/vehicle-detail";
import { CreateVehicleModal } from "../components/create-vehicle-modal";
import { WebPreviewModal } from "../components/web-preview-modal";
import { StockSkeleton } from "../components/stock-skeleton";
import { Vehicle } from "../data/mock-data";

export default function StockPage() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const {
    vehicles,
    loading,
    handleVehicleUpdate,
    handleVehicleReorder,
    handlePriceUpdate,
    handleVehicleDelete,
    handleSaveNewVehicle,
  } = usePanelDataContext();

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const handleVehicleUpdateWithSync = useCallback(
    (vehicleId: string, updates: Partial<Vehicle>) => {
      handleVehicleUpdate(vehicleId, updates);
      if (selectedVehicle?.id === vehicleId) {
        setSelectedVehicle((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [handleVehicleUpdate, selectedVehicle?.id]
  );

  const handleVehicleDeleteAndClose = useCallback(
    async (vehicleId: string) => {
      await handleVehicleDelete(vehicleId);
      setSelectedVehicle(null);
    },
    [handleVehicleDelete]
  );

  const handleWebPreview = useCallback((vehicle: Vehicle) => {
    setPreviewVehicle(vehicle);
    setIsWebPreviewOpen(true);
  }, []);

  if (loading) return <StockSkeleton />;

  return (
    <>
      <StockSection
        vehicles={filteredVehicles}
        onVehicleClick={setSelectedVehicle}
        onReorder={handleVehicleReorder}
        onPriceUpdate={handlePriceUpdate}
        onCreateVehicle={() => setIsCreateModalOpen(true)}
      />

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetail
            vehicle={selectedVehicle}
            onClose={() => setSelectedVehicle(null)}
            onUpdate={handleVehicleUpdateWithSync}
            onWebPreview={handleWebPreview}
            onDelete={handleVehicleDeleteAndClose}
          />
        )}
      </AnimatePresence>

      <CreateVehicleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewVehicle}
      />

      <WebPreviewModal
        isOpen={isWebPreviewOpen}
        onClose={() => setIsWebPreviewOpen(false)}
        vehicle={previewVehicle}
      />
    </>
  );
}
