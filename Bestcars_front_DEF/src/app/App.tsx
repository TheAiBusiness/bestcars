import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Footer } from "./components/Footer";

const HomePage = lazy(() => import("./pages/HomePage"));
const GaragePage = lazy(() => import("./pages/GaragePage"));
const VehicleDetailPage = lazy(() => import("./pages/VehicleDetailPage"));
const ScenePreviewPage = lazy(() => import("./pages/ScenePreviewPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070A10]">
      <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/garage" element={<GaragePage />} />
            <Route path="/scene-preview" element={<ScenePreviewPage />} />
            <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
      <Toaster position="bottom-right" richColors theme="dark" />
    </BrowserRouter>
  );
}
