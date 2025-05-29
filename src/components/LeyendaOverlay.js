// src/components/LeyendaOverlay.js
// Componente que muestra una leyenda flotante sobre el mapa con la simbología de colores y elementos gráficos

import React, { useRef, useLayoutEffect, useMemo } from "react";
import { useMap } from "react-leaflet"; // Hook para obtener el mapa Leaflet actual
import { escaleras2, salidaLeyenda } from "../constants/AppConstants"; // Imágenes utilizadas en la leyenda

/**
 * Componente LeyendaOverlayComponent
 * Muestra una leyenda estática sobre el mapa que informa del significado de colores por sector,
 * y de símbolos como escaleras, salidas o aulas coordinadoras.
 *
 * @param {string} plantaSeleccionada - Planta actualmente visible en el mapa.
 * @param {object} aulasData - Objeto con las aulas agrupadas por planta.
 */
function LeyendaOverlayComponent({ plantaSeleccionada, aulasData }) {
  const map = useMap(); // Referencia al objeto del mapa Leaflet
  const overlayRef = useRef(null); // Referencia al contenedor de la leyenda en el DOM
  const prevPointRef = useRef({ x: 0, y: 0 }); // Almacena la última posición para evitar renders innecesarios

  // Coordenadas fijas donde se ubicará la leyenda (en el centro de un área reservada del plano)
  const leyendaCenter = useMemo(() => {
    const leyendaCoords = { supIzq: [1775, 128], infDer: [327, 1224] };
    return {
      lat: (leyendaCoords.supIzq[0] + leyendaCoords.infDer[0]) / 2,
      lng: (leyendaCoords.supIzq[1] + leyendaCoords.infDer[1]) / 2,
    };
  }, []);

  // Actualiza la posición de la leyenda cuando se mueve o hace zoom en el mapa
  useLayoutEffect(() => {
    function updatePosition() {
      if (overlayRef.current) {
        const point = map.latLngToContainerPoint(leyendaCenter);
        // Evita reposicionar si el cambio de coordenadas es insignificante
        if (
          Math.abs(point.x - prevPointRef.current.x) < 1 &&
          Math.abs(point.y - prevPointRef.current.y) < 1
        ) {
          return;
        }
        overlayRef.current.style.left = `${point.x}px`;
        overlayRef.current.style.top = `${point.y}px`;
        prevPointRef.current = { x: point.x, y: point.y };
      }
    }

    // Escuchar eventos de zoom y desplazamiento del mapa
    map.on("zoomend moveend", updatePosition);
    updatePosition();

    return () => {
      map.off("zoomend moveend", updatePosition);
    };
  }, [map, leyendaCenter]);

  // Obtener los sectores únicos en la planta actual, para mostrar su color en la leyenda
  const currentAulas = aulasData[plantaSeleccionada] || [];
  const uniqueSectors = [];
  currentAulas.forEach((aula) => {
    if (!uniqueSectors.some((item) => item.sector === aula.sector)) {
      uniqueSectors.push({ sector: aula.sector, color: aula.color });
    }
  });

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        padding: "10px",
        border: "2px solid black",
        borderRadius: "5px",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxWidth: "200px",
      }}
    >
      {/* Título de la leyenda */}
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "4px",
          textAlign: "center",
        }}
      >
        LEYENDA
      </div>

      {/* Colores por sector */}
      {uniqueSectors.map((item, index) => (
        <div key={index} style={{ display: "flex", alignItems: "center" }}>
          <span
            className="legend-circle"
            style={{
              width: "15px",
              height: "15px",
              borderRadius: "50%",
              backgroundColor: item.color,
              marginRight: "6px",
            }}
          ></span>
          <span>{item.sector}</span>
        </div>
      ))}

      {/* Aula coordinadora */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          className="legend-square-coordinadora"
          style={{
            display: "inline-block",
            width: "15px",
            height: "15px",
            backgroundColor: "white",
            border: "2px solid red",
            marginRight: "6px",
          }}
        ></span>
        <span>Aula Coordinadora</span>
      </div>

      {/* Salidas */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={salidaLeyenda}
          alt="Salidas"
          style={{ height: "30px", marginRight: "6px" }}
        />
        <span>Salidas</span>
      </div>

      {/* Escaleras */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={escaleras2}
          alt="Escaleras"
          style={{ height: "30px", marginRight: "6px" }}
        />
        <span>Escaleras</span>
      </div>
    </div>
  );
}

// Memoización para evitar renders innecesarios si las props no cambian
export const LeyendaOverlay = React.memo(LeyendaOverlayComponent);
