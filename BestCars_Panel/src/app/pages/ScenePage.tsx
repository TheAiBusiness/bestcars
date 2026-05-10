import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePanelDataContext } from "../../contexts/PanelDataContext";
import { SceneEditorSection } from "../components/scene-editor-section";

export default function ScenePage() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const { token, apiMode } = useAuth();
  const { vehicles } = usePanelDataContext();

  return (
    <SceneEditorSection
      vehicles={vehicles}
      searchQuery={searchQuery}
      apiMode={apiMode}
      isAuthenticated={!!token}
    />
  );
}
