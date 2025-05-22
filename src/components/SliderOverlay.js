// src/components/SliderOverlay.js
// Componente que muestra un carrusel de fotos asociadas a un aula, en forma de overlay emergente sobre el resto del contenido

import React from "react";
import { fotosMap, fotosLabels } from "../constants/AppConstants"; // Diccionarios con rutas y nombres descriptivos de las fotos

/**
 * Componente SliderOverlay
 * Renderiza un carrusel interactivo con imágenes asociadas a un aula específica, permitiendo la navegación manual entre ellas.
 *
 * @param {object|null} aula - Aula actualmente seleccionada, que contiene un arreglo de fotos (nombres clave).
 * @param {number} slideIndex - Índice actual de la foto mostrada.
 * @param {function} setSlideIndex - Función para cambiar el índice de la foto visible.
 * @param {function} onClose - Función que se invoca al cerrar el overlay.
 */
export function SliderOverlay({ aula, slideIndex, setSlideIndex, onClose }) {
  // No mostrar nada si no hay aula seleccionada o no contiene fotos
  if (!aula || !aula.fotos) return null;

  // Foto actualmente visible según el índice proporcionado
  const fotoActual = aula.fotos[slideIndex];
  const nombreFoto = fotosLabels[fotoActual] || fotoActual;

  return (
    // Overlay que cubre toda la pantalla y se cierra al hacer clic fuera del contenido
    <div className="slider-overlay" onClick={onClose}>
      {/* Contenedor principal del carrusel; evita cierre al clic interno */}
      <div className="slider-content" onClick={(e) => e.stopPropagation()}>
        {/* Botón de cierre del overlay */}
        <button className="slider-close" onClick={onClose}>×</button>

        {/* Mapea todas las fotos del aula, mostrando solo la activa con clase 'active' */}
        {aula.fotos.map((f, i) => (
          <img
            key={i}
            src={fotosMap[f]} // Ruta real de la foto desde el diccionario
            alt={fotosLabels[f] || `Foto ${i + 1}`} // Texto alternativo descriptivo
            className={`slider-img ${i === slideIndex ? "active" : ""}`} // Clase activa para visibilidad
          />
        ))}

        {/* Pie de foto (nombre descriptivo) centrado debajo de la imagen */}
        <div className="slider-caption">
          {nombreFoto}
        </div>

        {/* Botón navegación hacia la foto anterior */}
        <button
          className="slider-prev"
          onClick={() =>
            setSlideIndex((slideIndex + aula.fotos.length - 1) % aula.fotos.length)
          }
        >
          {/* Icono SVG flecha izquierda */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 6L9 12L15 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Botón navegación hacia la foto siguiente */}
        <button
          className="slider-next"
          onClick={() =>
            setSlideIndex((slideIndex + 1) % aula.fotos.length)
          }
        >
          {/* Icono SVG flecha derecha */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
