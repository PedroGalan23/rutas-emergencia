// src/components/AppHeader.js
// Componente de cabecera de la aplicación que contiene el título y los controles de interacción

import React from "react";
import monje2 from "../assets/monje2.png";
import playIcon from "../assets/play.svg"; // tu icono de “play”
import { plantLabels, planos } from "../constants/AppConstants";

export function AppHeader({
  isMobile,
  aulaActiva,
  setSliderOpen,
  setSlideIndex,
  imprimible,
  setImprimible,
  plantaSeleccionada,
  setPlantaSeleccionada,
  setAulaActiva,
  setAlertMessage,
}) {
  return (
    <header className="app-header">
      {/* Título con icono del monje. En móviles solo el icono, en escritorio icono + texto */}
      <h1>
        <img
          src={monje2}
          alt="Monje"
          style={{ height: "1.8em", verticalAlign: "middle", marginRight: "0.5em" }}
        />
        {!isMobile && "PLAN DE EVACUACIÓN"}
      </h1>
      {/* Botón de reproducir carrusel de fotos (solo se muestra si hay un aula activa) */}
      {aulaActiva && (
        <button
          className="btn-play"
          onClick={() => {
            if (!aulaActiva.fotos || aulaActiva.fotos.length === 0) {
              window.alert("Esta aula no tiene carrusel de fotos asignado.");
            } else {
              if (!aulaActiva.fotos || aulaActiva.fotos.length === 0) {
                setAlertMessage("Esta aula no tiene carrusel de fotos asignado.");
              } else {
                setSlideIndex(0);
                setSliderOpen(true);
              }
            }
          }}
        >
          <img src={playIcon} alt="Ver ruta en fotos" />
        </button>
      )}
      <div className="controls">
        {/* Switch de "Modo Impresión" (solo visible en vista no móvil) */}
        {!isMobile && (
          <div className="switch-wrapper">
            <label className="switch">
              <input
                type="checkbox"
                checked={imprimible}
                onChange={(e) => setImprimible(e.target.checked)}
              />
              <span className="slider round" />
            </label>
            <span className="switch-label">Modo Impresión</span>
          </div>
        )}

        {/* Selector de planta (siempre visible) */}
        <div className="selector-wrapper">
          <label htmlFor="planta" className="selector-label">
            Selecciona una planta:
          </label>
          <div className="plant-selector">
            {Object.keys(planos).map((p) => (
              <button
                key={p}
                className={`plant-button ${plantaSeleccionada === p ? "active" : ""}`}
                onClick={() => {
                  setPlantaSeleccionada(p);
                  if (setAulaActiva) setAulaActiva(null);
                  setSliderOpen(false);
                  // Reiniciar flecha de ruta (se maneja en useRouteAnimation mediante cambio de aulaActiva)
                }}
              >
                {plantLabels[p]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
