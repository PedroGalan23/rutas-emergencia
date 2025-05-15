import React from "react";
import { fotosMap, fotosLabels } from "../constants/AppConstants";

export function SliderOverlay({ aula, slideIndex, setSlideIndex, onClose }) {
  if (!aula || !aula.fotos) return null;

  const fotoActual = aula.fotos[slideIndex];
  const nombreFoto = fotosLabels[fotoActual] || fotoActual;

  return (
    <div className="slider-overlay" onClick={onClose}>
      <div className="slider-content" onClick={(e) => e.stopPropagation()}>
        <button className="slider-close" onClick={onClose}>×</button>

        {aula.fotos.map((f, i) => (
          <img
            key={i}
            src={fotosMap[f]}
            alt={fotosLabels[f] || `Foto ${i + 1}`}
            className={`slider-img ${i === slideIndex ? "active" : ""}`}
          />
        ))}

        {/* Pie de foto centrado */}
        <div className="slider-caption">
          {nombreFoto}
        </div>

        <button className="slider-prev" onClick={() =>
          setSlideIndex((slideIndex + aula.fotos.length - 1) % aula.fotos.length)
        }>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 6L9 12L15 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button className="slider-next" onClick={() =>
          setSlideIndex((slideIndex + 1) % aula.fotos.length)
        }>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
