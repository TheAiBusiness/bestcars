import React from "react";
import { Link } from "react-router-dom";
import "./NextSceneButton.css";

interface NextSceneButtonProps {
  sceneIndex?: number;
  totalScenes?: number;
  isStockMenuOpen?: boolean;
  isTermsOpen?: boolean;
}

export function NextSceneButton({
  sceneIndex = 0,
  totalScenes = 0,
  isStockMenuOpen = false,
  isTermsOpen = false,
}: NextSceneButtonProps) {
  if (totalScenes < 2 || isStockMenuOpen || isTermsOpen) return null;

  const nextIndex = (sceneIndex + 1) % totalScenes;
  const label = totalScenes > 2 ? "Escena " + (nextIndex + 1) : "Ver otra escena";

  return (
    <Link
      to={"/garage?scene=" + nextIndex}
      className="next-scene-btn"
      aria-label={label}
    >
      <span className="next-scene-icon">
        <svg width="13" height="11" viewBox="0 0 13 11" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white">
          <line x1="11.7052" y1="4.77742" x2="6.8748" y2="9.60777" strokeWidth="2" />
          <path d="M10.2912 4.77745L6.89487 1.38135" strokeWidth="2" />
          <line x1="10.5151" y1="5.45581" x2="0.998047" y2="5.45581" strokeWidth="2" />
        </svg>
      </span>
      <span className="next-scene-text">{label}</span>
    </Link>
  );
}

export default NextSceneButton;
