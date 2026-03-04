import React from "react";
import { Link } from "react-router-dom";
import "./NextSceneButton.css";

interface NextSceneButtonProps {
  sceneIndex?: number;
  totalScenes?: number;
  isStockMenuOpen?: boolean;
  isTermsOpen?: boolean;
  fromGarage?: boolean;
  /** true cuando se muestra en HomePage (/) — ciclo abierto: prev=última escena, next=primera */
  fromHome?: boolean;
}

function ChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

export function NextSceneButton({
  sceneIndex = 0,
  totalScenes = 0,
  isStockMenuOpen = false,
  isTermsOpen = false,
  fromGarage = false,
  fromHome = false,
}: NextSceneButtonProps) {
  if (isStockMenuOpen || isTermsOpen) return null;

  if (fromGarage) {
    if (totalScenes < 1) return null;
    return (
      <Link to="/experiencia?index=0" className="scene-nav scene-nav--right" aria-label="Ver escenas">
        <ChevronRight />
        <span className="scene-nav__label">Ver escenas</span>
      </Link>
    );
  }

  // HomePage: ciclo abierto — prev = última escena, next = primera escena
  if (fromHome) {
    if (totalScenes < 1) return null;
    const lastIndex = totalScenes - 1;
    return (
      <>
        <Link to={`/experiencia?index=${lastIndex}`} className="scene-nav scene-nav--left" aria-label="Última escena">
          <ChevronLeft />
          <span className="scene-nav__label">Última escena</span>
        </Link>
        <Link to="/experiencia?index=0" className="scene-nav scene-nav--right" aria-label="Ver experiencia">
          <span className="scene-nav__label">Ver experiencia</span>
          <ChevronRight />
        </Link>
      </>
    );
  }

  if (totalScenes < 2) return null;

  // /experiencia: ciclo abierto con HomePage — desde index 0 prev → /, desde última next → /
  const prevIndex = sceneIndex - 1;
  const nextIndex = sceneIndex + 1;
  const prevDest = prevIndex < 0 ? "/" : `/experiencia?index=${prevIndex}`;
  const nextDest = nextIndex >= totalScenes ? "/" : `/experiencia?index=${nextIndex}`;
  const prevLabel = prevIndex < 0 ? "Inicio" : `Escena ${prevIndex + 1}`;
  const nextLabel = nextIndex >= totalScenes ? "Inicio" : `Escena ${nextIndex + 1}`;

  return (
    <>
      <Link to={prevDest} className="scene-nav scene-nav--left" aria-label={prevLabel}>
        <ChevronLeft />
        <span className="scene-nav__label">{prevLabel}</span>
      </Link>
      <Link to={nextDest} className="scene-nav scene-nav--right" aria-label={nextLabel}>
        <span className="scene-nav__label">{nextLabel}</span>
        <ChevronRight />
      </Link>
    </>
  );
}

export default NextSceneButton;
