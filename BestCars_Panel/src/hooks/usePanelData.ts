import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Vehicle, Lead } from "../app/data/mock-data";
import { mockVehicles, mockLeads } from "../app/data/mock-data";
import { useLocalStorageState } from "../app/hooks/use-local-storage-state";
import {
  getVehicles,
  getContacts,
  getTestDrives,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateContact,
  updateTestDrive,
} from "../services/api";
import { apiVehicleToPanel, panelVehicleToApiCreate, panelVehicleToApiUpdate } from "../adapters/vehicleAdapter";
import { apiContactToLead, apiTestDriveToLead, leadStatusToApi } from "../adapters/leadAdapter";

export function usePanelData(apiMode: boolean, isAuthenticated: boolean) {
  const [vehicles, setVehiclesState] = useLocalStorageState<Vehicle[]>("autopanel_vehicles", mockVehicles);
  const [leads, setLeadsState] = useLocalStorageState<Lead[]>("autopanel_leads", mockLeads);
  const [loading, setLoading] = useState(false);

  // Fetch from API when in API mode and authenticated
  useEffect(() => {
    if (!apiMode || !isAuthenticated) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([getVehicles(), getContacts(), getTestDrives()])
      .then(([vList, contacts, testDrives]) => {
        if (cancelled) return;
        const panelVehicles = vList.map(apiVehicleToPanel);
        const contactLeads = contacts.map(apiContactToLead);
        const testDriveLeads = testDrives.map(apiTestDriveToLead);
        setVehiclesState(panelVehicles);
        setLeadsState([...contactLeads, ...testDriveLeads]);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Error al cargar datos";
          const isNetwork = msg === "Failed to fetch" || msg.includes("NetworkError");
          toast.error(
            isNetwork
              ? "No se pudo conectar al servidor. Arranca el backend (Bestcars_Back_DEF con npm run dev). Usando datos locales."
              : msg
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMode, isAuthenticated, setVehiclesState, setLeadsState]);

  const handleVehicleUpdate = useCallback(
    async (vehicleId: string, updates: Partial<Vehicle>) => {
      if (apiMode && isAuthenticated) {
        try {
          await updateVehicle(vehicleId, panelVehicleToApiUpdate(updates));
          setVehiclesState((prev) =>
            prev.map((v) =>
              v.id === vehicleId ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
            )
          );
          toast.success("Vehículo actualizado");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Error al actualizar");
        }
      } else {
        setVehiclesState((prev) =>
          prev.map((v) =>
            v.id === vehicleId ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
          )
        );
        toast.success("Vehículo actualizado");
      }
    },
    [apiMode, isAuthenticated, setVehiclesState]
  );

  const handleVehicleReorder = useCallback(
    async (reorderedVehicles: Vehicle[]) => {
      const updated = reorderedVehicles.map((v, i) => ({ ...v, priority: i + 1 }));
      setVehiclesState(updated);
      if (apiMode && isAuthenticated) {
        try {
          await Promise.all(updated.map((v, i) => updateVehicle(v.id, { priority: i + 1 })));
          toast.success("Orden actualizado");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Error al actualizar orden");
        }
      }
    },
    [apiMode, isAuthenticated, setVehiclesState]
  );

  const handlePriceUpdate = useCallback(
    async (vehicleId: string, newPrice: number) => {
      const updates = {
        price: newPrice,
        priceHistory: [] as { date: string; price: number }[],
        updatedAt: new Date().toISOString(),
      };
      const v = vehicles.find((x) => x.id === vehicleId);
      if (v) {
        updates.priceHistory = [
          ...v.priceHistory,
          { date: new Date().toISOString(), price: newPrice },
        ];
      }

      if (apiMode && isAuthenticated) {
        try {
          await updateVehicle(vehicleId, { price: `€${newPrice.toLocaleString("es-ES")}` });
          setVehiclesState((prev) =>
            prev.map((x) => (x.id === vehicleId ? { ...x, ...updates } : x))
          );
          toast.success("Precio actualizado");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Error al actualizar");
        }
      } else {
        setVehiclesState((prev) =>
          prev.map((x) => (x.id === vehicleId ? { ...x, ...updates } : x))
        );
        toast.success("Precio actualizado");
      }
    },
    [apiMode, isAuthenticated, vehicles, setVehiclesState]
  );

  const handleLeadUpdate = useCallback(
    async (leadId: string, updates: Partial<Lead>) => {
      if (apiMode && isAuthenticated) {
        const isContact = leadId.startsWith("contact-");
        const isTestDrive = leadId.startsWith("testdrive-");
        const id = parseInt(leadId.replace(/\D/g, ""), 10);
        try {
          if (isContact) await updateContact(id, { status: updates.status ? leadStatusToApi(updates.status) : undefined, notes: updates.notes });
          else if (isTestDrive) await updateTestDrive(id, { status: updates.status ? leadStatusToApi(updates.status) : undefined, notes: updates.notes });
          setLeadsState((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l))
          );
          toast.success("Lead actualizado");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Error al actualizar");
        }
      } else {
        setLeadsState((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l))
        );
        toast.success("Lead actualizado");
      }
    },
    [apiMode, isAuthenticated, setLeadsState]
  );

  const handleSaveNewVehicle = useCallback(
    async (vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "priority">) => {
      if (apiMode && isAuthenticated) {
        try {
          const created = await createVehicle(panelVehicleToApiCreate(vehicle));
          const panelVehicle = apiVehicleToPanel(created);
          setVehiclesState((prev) => [...prev, { ...panelVehicle, priority: prev.length + 1 }]);
          toast.success(`Vehículo "${vehicle.name}" creado`);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Error al crear");
        }
      } else {
        const now = new Date().toISOString();
        setVehiclesState((prev) => [
          ...prev,
          {
            ...vehicle,
            id: `v${Date.now()}`,
            createdAt: now,
            updatedAt: now,
            priority: prev.length + 1,
          } as Vehicle,
        ]);
        toast.success(`Vehículo "${vehicle.name}" creado`);
      }
    },
    [apiMode, isAuthenticated, setVehiclesState]
  );

  return {
    vehicles,
    leads,
    loading,
    setVehiclesState,
    handleVehicleUpdate,
    handleVehicleReorder,
    handlePriceUpdate,
    handleLeadUpdate,
    handleSaveNewVehicle,
  };
}
