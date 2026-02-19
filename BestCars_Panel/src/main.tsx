/**
 * Punto de entrada de la aplicación BestCars Panel.
 * Monta el componente raíz en el DOM y carga los estilos globales.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./app/App.tsx";
import "./styles/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el elemento #root");

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
