// src/components/AppHeader.js
// Componente de cabecera de la aplicación que contiene el título y los controles de interacción

import React from "react";
import monje2 from "../assets/monje2.png"; // Icono del monje que se muestra en el título
import playIcon from "../assets/play.svg"; // Icono del botón de “play” para iniciar carrusel
import { plantLabels, planos } from "../constants/AppConstants"; // Diccionarios con etiquetas de plantas y rutas de planos

/**
 * Componente AppHeader
 * Muestra la cabecera de la aplicación con título, controles de planta, modo impresión y carrusel de fotos
 */
export function AppHeader({
  isMobile,                // Booleano: true si es móvil, false si es escritorio
  aulaActiva,              // Objeto del aula actualmente seleccionada
  setSliderOpen,           // Función para abrir el carrusel de fotos
  setSlideIndex,           // Función para establecer el índice inicial del carrusel
  imprimible,              // Booleano que indica si está activado el modo impresión
  setImprimible,           // Función para activar/desactivar modo impresión
  plantaSeleccionada,      // Planta actualmente seleccionada
  setPlantaSeleccionada,   // Función para cambiar la planta seleccionada
  setAulaActiva,           // Función para deseleccionar el aula activa
  setAlertMessage          // Función para mostrar un mensaje de alerta
}) {
  return (
    <header className="app-header">
      {/* Título con icono del monje. En móvil solo se muestra el icono, en escritorio también el texto */}
      <h1>
        <img
          src={monje2}
          alt="Monje"
          style={{ height: "1.8em", verticalAlign: "middle", marginRight: "0.5em" }}
        />
        {!isMobile && "PLAN DE EVACUACIÓN"} {/* Solo se muestra en escritorio */}
      </h1>

      {/* Botón de reproducción del carrusel de fotos (solo visible si hay aula activa) */}
      {aulaActiva && (
        <button
          className="btn-play"
          onClick={() => {
            // Si el aula no tiene fotos, se muestra alerta
            if (!aulaActiva.fotos || aulaActiva.fotos.length === 0) {
              window.alert("Esta aula no tiene carrusel de fotos asignado.");
              setAlertMessage("Esta aula no tiene carrusel de fotos asignado.");
            } else {
              // Se abre el carrusel desde la primera foto
              setSlideIndex(0);
              setSliderOpen(true);
            }
          }}
        >
          <img src={playIcon} alt="Ver ruta en fotos" />
        </button>
      )}

      <div className="controls">
        {/* Modo impresión: interruptor solo visible en escritorio */}
        {!isMobile && (
          <div className="switch-wrapper">
            <label className="switch">
              <input
                type="checkbox"
                checked={imprimible}
                onChange={(e) => setImprimible(e.target.checked)} // Cambia el estado de modo impresión
              />
              <span className="slider round" />
            </label>
            <span className="switch-label">Modo Impresión</span>
          </div>
        )}

        {/* Selector de planta: siempre visible */}
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
                  // Al cambiar de planta, se deselecciona el aula activa y se cierra el carrusel
                  setPlantaSeleccionada(p);
                  if (setAulaActiva) setAulaActiva(null);
                  setSliderOpen(false);
                }}
              >
                {plantLabels[p]} {/* Texto descriptivo de la planta */}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
