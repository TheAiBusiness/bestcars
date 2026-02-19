import React from "react";
import { Link } from "react-router-dom";
import "./BackArrow.css";

interface BackArrowProps {
  isMenuOpen?: boolean;
}

export default function BackArrow({ isMenuOpen = false }: BackArrowProps) {
  return (
    <Link 
      to="/" 
      className={`back-arrow-btn ${isMenuOpen ? 'menu-open' : ''}`}
    >
      <span className="back-arrow-icon">
        <svg 
          width="13" 
          height="11" 
          viewBox="0 0 13 11" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          stroke="white"
        >
          <line x1="1.2948" y1="4.77742" x2="6.1252" y2="9.60777" strokeWidth="2" />
          <path d="M2.7088 4.77745L6.10513 1.38135" strokeWidth="2" />
          <line x1="2.4849" y1="5.45581" x2="12.002" y2="5.45581" strokeWidth="2" />
        </svg>
      </span>
      <span className="back-arrow-text">Volver</span>
    </Link>
  );
}
