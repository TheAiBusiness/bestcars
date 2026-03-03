import React from "react";
import { Link } from "react-router-dom";
import "./NextSceneButton.css";

interface NextSceneButtonProps {
  sceneIndex?: number;
  totalScenes?: number;
  isStockMenuOpen?: boolean;
  isTermsOpen?: boolean;
  fromGarage?: boolean;
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
}: NextSceneButtonProps) {
  if (isStockMenuOpen || isTermsOpen) return null;

  if (fromGarage) {
    if (totalScenes < 1) return null;
    return (
      <Link to="/escena?index=0" className="scene-nav scene-nav--right" aria-label="Ver escenas">
        <ChevronRight />
        <span className="scene-nav__label">Ver escenas</span>
      </Link>
    );
  }

  if (totalScenes < 2) return null;

  const prevIndex = (sceneIndex - 1 + totalScenes) % totalScenes;
  const nextIndex = (sceneIndex + 1) % totalScenes;

  const isPrevGarage = prevIndex === 0 && sceneIndex === 1;
  const isNextGarage = nextIndex === 0;

  const prevDest = isPrevGarage ? "/garage" : `/escena?index=${prevIndex}`;
  const nextDest = isNextGarage ? "/garage" : `/escena?index=${nextIndex}`;

  const prevLabel = isPrevGarage ? "Garaje" : `Escena ${prevIndex + 1}`;
  const nextLabel = isNextGarage ? "Garaje" : `Escena ${nextIndex + 1}`;

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
