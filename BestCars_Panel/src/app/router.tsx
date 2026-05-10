import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PanelDataProvider } from "../contexts/PanelDataContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/dashboard-layout";
import { Header } from "./components/header";
import { StockSkeleton } from "./components/stock-skeleton";
import { LeadsSkeleton } from "./components/leads-skeleton";
import { ErrorBoundary } from "./components/error-boundary";
import { Toaster } from "sonner";

const StockPage = lazy(() => import("./pages/StockPage"));
const LeadsPage = lazy(() => import("./pages/LeadsPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const ScenePage = lazy(() => import("./pages/ScenePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const WebPreviewPage = lazy(() => import("./pages/WebPreviewPage"));

const sectionTitles: Record<string, string> = {
  stock: "Gestión de Stock",
  leads: "Gestión de Leads",
  stats: "Estadísticas y Rendimiento",
  scene: "Editor de Escena",
  settings: "Configuración",
  webpreview: "Vista Previa Web",
};

const searchPlaceholders: Record<string, string> = {
  stock: "Buscar vehículos por marca, modelo...",
  leads: "Buscar leads por nombre, email...",
  stats: "Filtrar estadísticas...",
  scene: "Buscar vehículos para colocar...",
  settings: "Buscar configuración...",
  webpreview: "Buscar en vista web...",
};

function SectionFallback({ section }: { section: string }) {
  if (section === "leads") return <LeadsSkeleton />;
  return <StockSkeleton />;
}

function ProtectedLayout() {
  const { token, apiMode, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  if (apiMode && !token) {
    return <Navigate to="/login" replace />;
  }

  const path = window.location.pathname.replace(/^\//, "").split("/")[0] || "stock";
  const activeSection = path;

  const handleSectionChange = (section: string) => {
    navigate(`/${section}`);
  };

  const handleSearch = (value: string) => {
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <PanelDataProvider>
    <div className="min-h-screen bg-black">
      <DashboardLayout
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={apiMode ? logout : undefined}
      >
        <Header
          title={sectionTitles[activeSection] || "BestCars Panel"}
          searchPlaceholder={searchPlaceholders[activeSection] || "Buscar..."}
          searchValue={searchQuery}
          onSearch={handleSearch}
        />
        <div
          className={
            activeSection === "webpreview"
              ? "flex-1 flex flex-col min-h-0 overflow-hidden"
              : "flex-1 overflow-y-auto"
          }
        >
          <ErrorBoundary key={activeSection}>
            <Suspense fallback={<SectionFallback section={activeSection} />}>
              <Outlet context={{ searchQuery }} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </DashboardLayout>
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
    </PanelDataProvider>
  );
}

function LoginRoute() {
  const { token, apiMode } = useAuth();
  if (apiMode && token) {
    return <Navigate to="/stock" replace />;
  }
  if (!apiMode) {
    return <Navigate to="/stock" replace />;
  }
  return <LoginPage />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/stock" replace /> },
      { path: "stock", element: <StockPage /> },
      { path: "leads", element: <LeadsPage /> },
      { path: "stats", element: <StatsPage /> },
      { path: "scene", element: <ScenePage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "webpreview", element: <WebPreviewPage /> },
      { path: "*", element: <Navigate to="/stock" replace /> },
    ],
  },
]);
