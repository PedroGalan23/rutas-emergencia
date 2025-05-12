// src/components/SliderOverlay.js
// Componente de carrusel de fotos que aparece al seleccionar el botón de "play" en un aula

import React from "react";
import { fotosMap } from "../constants/AppConstants";

export function SliderOverlay({ aula, slideIndex, setSlideIndex, onClose }) {
  if (!aula || !aula.fotos) return null;

  return (
    <div className="slider-overlay" onClick={onClose}>
      <div className="slider-content" onClick={(e) => e.stopPropagation()}>
        {/* Botón de cierre */}
        <button className="slider-close" onClick={onClose}>
          ×
        </button>
        {/* Imágenes del carrusel */}
        {aula.fotos.map((f, i) => (
          <img
            key={i}
            src={fotosMap[f]}
            alt={`Punto ${i + 1}`}
            className={`slider-img ${i === slideIndex ? "active" : ""}`}
          />
        ))}
        {/* Controles de navegación del carrusel */}
        <button
          className="slider-prev"
          onClick={() =>
            setSlideIndex((slideIndex + aula.fotos.length - 1) % aula.fotos.length)
          }
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 6L9 12L15 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className="slider-next"
          onClick={() =>
            setSlideIndex((slideIndex + 1) % aula.fotos.length)
          }
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
