import React from "react";
import { Link } from "react-router-dom";
import "./GarageArrow.css";

interface GarageArrowProps {
  isMenuOpen?: boolean;
  isTermsOpen?: boolean;
}

export default function GarageArrow({ isMenuOpen = false, isTermsOpen = false }: GarageArrowProps) {
  return (
    <Link 
      to="/garage" 
      className={`garage-arrow-btn ${isMenuOpen ? 'menu-open' : ''} ${isTermsOpen ? 'terms-open' : ''}`}
    >
      <span className="garage-arrow-icon">
        <svg 
          width="13" 
          height="11" 
          viewBox="0 0 13 11" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          stroke="white"
        >
          <line x1="11.7052" y1="4.77742" x2="6.8748" y2="9.60777" strokeWidth="2" />
          <path d="M10.2912 4.77745L6.89487 1.38135" strokeWidth="2" />
          <line x1="10.5151" y1="5.45581" x2="0.998047" y2="5.45581" strokeWidth="2" />
        </svg>
      </span>
      <span className="garage-arrow-text">Entrar al garaje</span>
    </Link>
  );
}
