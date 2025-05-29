import React, { useEffect, useRef } from "react";
import { fotosMap, fotosLabels } from "../constants/AppConstants";

export function SliderOverlay({ aula, slideIndex, setSlideIndex, onClose }) {
  const timeoutRef = useRef(null);
  const userInteractedRef = useRef(false); // Para saber si ya hubo interacción manual

  // Avanzar automáticamente si no ha habido interacción manual
  useEffect(() => {
    if (!aula?.fotos?.length) return;
    if (userInteractedRef.current) return;

    timeoutRef.current = setTimeout(() => {
      setSlideIndex((slideIndex + 1) % aula.fotos.length);
    }, 3000);

    return () => clearTimeout(timeoutRef.current);
  }, [slideIndex, aula?.fotos?.length, setSlideIndex]);

  if (!aula?.fotos?.length) return null;

  const fotoActual = aula.fotos[slideIndex];
  const nombreFoto = fotosLabels[fotoActual] || fotoActual;

  // Detectar interacción manual tocando la pantalla
  const handleUserInteraction = () => {
    if (!userInteractedRef.current) {
      userInteractedRef.current = true;
      clearTimeout(timeoutRef.current);
    }
  };

  const tieneVariasFotos = aula.fotos.length > 1;

  return (
    <div className="slider-overlay" onClick={onClose}>
      <div
        className="slider-content"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleUserInteraction}
      >
        <button className="slider-close" onClick={onClose}>
          ×
        </button>

        {aula.fotos.map((f, i) => (
          <img
            key={i}
            src={fotosMap[f]}
            alt={fotosLabels[f] || `Foto ${i + 1}`}
            className={`slider-img ${i === slideIndex ? "active" : ""}`}
          />
        ))}

        <div className="slider-caption">{nombreFoto}</div>

        {tieneVariasFotos && (
          <button
            className="slider-prev"
            onClick={() => {
              handleUserInteraction();
              setSlideIndex(
                (slideIndex + aula.fotos.length - 1) % aula.fotos.length
              );
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 6L9 12L15 18"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {tieneVariasFotos && (
          <button
            className="slider-next"
            onClick={() => {
              handleUserInteraction();
              setSlideIndex((slideIndex + 1) % aula.fotos.length);
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6L15 12L9 18"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
