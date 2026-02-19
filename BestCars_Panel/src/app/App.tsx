import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";

import { DashboardLayout } from "./components/dashboard-layout";
import { Header } from "./components/header";
import { StockSection } from "./components/stock-section";
import { VehicleDetail } from "./components/vehicle-detail";
import { CreateVehicleModal } from "./components/create-vehicle-modal";
import { WebPreviewModal } from "./components/web-preview-modal";
import { WebPreviewSection } from "./components/web-preview-section";
import { LeadsSection } from "./components/leads-section";
import { StatsSection } from "./components/stats-section";
import { SettingsSection } from "./components/settings-section";
import { SceneEditorSection } from "./components/scene-editor-section";
import { LoginPage } from "./pages/LoginPage";

import { Vehicle, Lead } from "./data/mock-data";
import { useAuth } from "../contexts/AuthContext";
import { usePanelData } from "../hooks/usePanelData";

type SectionId = "stock" | "leads" | "stats" | "scene" | "settings" | "webpreview";

export default function App() {
  const { token, isAuthenticated, apiMode, logout } = useAuth();
  const showLogin = apiMode && !token;

  const {
    vehicles,
    leads,
    loading,
    handleVehicleUpdate,
    handleVehicleReorder,
    handlePriceUpdate,
    handleLeadUpdate,
    handleSaveNewVehicle,
  } = usePanelData(apiMode, !!token);

  const [activeSection, setActiveSection] = useState<SectionId>("stock");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWebPreviewOpen, setIsWebPreviewOpen] = useState(false);
  const [previewVehicle, setPreviewVehicle] = useState<Vehicle | null>(null);

  const handleVehicleUpdateWithSync = useCallback(
    (vehicleId: string, updates: Partial<Vehicle>) => {
      handleVehicleUpdate(vehicleId, updates);
      if (selectedVehicle?.id === vehicleId) {
        setSelectedVehicle((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [handleVehicleUpdate, selectedVehicle?.id]
  );

  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedVehicle(null);
  }, []);

  const handleCreateVehicle = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleWebPreview = useCallback((vehicle: Vehicle) => {
    setPreviewVehicle(vehicle);
    setIsWebPreviewOpen(true);
  }, []);

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

  const filteredLeads = useMemo(() => {
    if (!normalizedQuery) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(normalizedQuery) ||
        l.email.toLowerCase().includes(normalizedQuery) ||
        l.phone.toLowerCase().includes(normalizedQuery)
    );
  }, [leads, normalizedQuery]);

  const sectionTitles: Record<SectionId, string> = {
    stock: "Gestión de Stock",
    leads: "Gestión de Leads",
    stats: "Estadísticas y Rendimiento",
    scene: "Editor de Escena",
    settings: "Configuración",
    webpreview: "Vista Previa Web",
  };

  const searchPlaceholders: Record<SectionId, string> = {
    stock: "Buscar vehículos por marca, modelo...",
    leads: "Buscar leads por nombre, email...",
    stats: "Filtrar estadísticas...",
    scene: "Buscar vehículos para colocar...",
    settings: "Buscar configuración...",
    webpreview: "Buscar en vista web...",
  };

  if (showLogin) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardLayout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={apiMode ? logout : undefined}
      >
        <Header
          title={sectionTitles[activeSection]}
          searchPlaceholder={searchPlaceholders[activeSection]}
          searchValue={searchQuery}
          onSearch={setSearchQuery}
        />

        <div
          className={
            activeSection === "webpreview"
              ? "flex-1 flex flex-col min-h-0 overflow-hidden"
              : "flex-1 overflow-y-auto"
          }
        >
          {loading && (
            <div className="p-8 text-center text-white/60">Cargando datos...</div>
          )}
          {!loading && activeSection === "stock" && (
            <StockSection
              vehicles={filteredVehicles}
              onVehicleClick={handleVehicleClick}
              onReorder={handleVehicleReorder}
              onPriceUpdate={handlePriceUpdate}
              onCreateVehicle={handleCreateVehicle}
            />
          )}
          {!loading && activeSection === "leads" && (
            <LeadsSection
              leads={filteredLeads}
              vehicles={vehicles}
              onLeadUpdate={handleLeadUpdate}
            />
          )}
          {activeSection === "stats" && <StatsSection vehicles={filteredVehicles} />}
          {activeSection === "scene" && (
            <SceneEditorSection vehicles={vehicles} searchQuery={searchQuery} />
          )}
          {activeSection === "settings" && <SettingsSection />}
          {!loading && activeSection === "webpreview" && (
            <WebPreviewSection
              vehicles={filteredVehicles}
              onVehiclePreview={handleWebPreview}
            />
          )}
        </div>
      </DashboardLayout>

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetail
            vehicle={selectedVehicle}
            onClose={handleCloseDetail}
            onUpdate={handleVehicleUpdateWithSync}
            onWebPreview={handleWebPreview}
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

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            backdropFilter: "blur(20px)",
          },
        }}
      />
    </div>
  );
}

