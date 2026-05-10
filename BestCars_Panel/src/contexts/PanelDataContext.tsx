import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { usePanelData } from "../hooks/usePanelData";

type PanelDataValue = ReturnType<typeof usePanelData>;

const PanelDataContext = createContext<PanelDataValue | null>(null);

export function PanelDataProvider({ children }: { children: React.ReactNode }) {
  const { token, apiMode } = useAuth();
  const data = usePanelData(apiMode, !!token);

  return (
    <PanelDataContext.Provider value={data}>
      {children}
    </PanelDataContext.Provider>
  );
}

export function usePanelDataContext() {
  const ctx = useContext(PanelDataContext);
  if (!ctx) throw new Error("usePanelDataContext must be used within PanelDataProvider");
  return ctx;
}
