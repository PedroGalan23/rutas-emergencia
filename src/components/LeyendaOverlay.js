// src/components/LeyendaOverlay.js
// Componente de overlay para la leyenda del mapa (significado de colores y símbolos)

import React, { useRef, useLayoutEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import { escaleras2, salidaLeyenda } from "../constants/AppConstants";

function LeyendaOverlayComponent({ plantaSeleccionada, aulasData }) {
  const map = useMap();
  const overlayRef = useRef(null);
  const prevPointRef = useRef({ x: 0, y: 0 });

  // Coordenadas fijas donde se debe posicionar la leyenda en el mapa
  const leyendaCenter = useMemo(() => {
    const leyendaCoords = { supIzq: [1775, 128], infDer: [327, 1224] };
    return {
      lat: (leyendaCoords.supIzq[0] + leyendaCoords.infDer[0]) / 2,
      lng: (leyendaCoords.supIzq[1] + leyendaCoords.infDer[1]) / 2,
    };
  }, []);

  // Reposicionar la leyenda en la pantalla en eventos de zoom o pan del mapa
  useLayoutEffect(() => {
    function updatePosition() {
      if (overlayRef.current) {
        const point = map.latLngToContainerPoint(leyendaCenter);
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
    map.on("zoomend moveend", updatePosition);
    updatePosition();
    return () => {
      map.off("zoomend moveend", updatePosition);
    };
  }, [map, leyendaCenter]);

  // Obtener la lista de sectores únicos presentes en la planta seleccionada
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
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "4px",
          textAlign: "center",
        }}
      >
        LEYENDA
      </div>
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
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={salidaLeyenda}
          alt="Salidas"
          style={{ height: "30px", marginRight: "6px" }}
        />
        <span>Salidas</span>
      </div>
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

export const LeyendaOverlay = React.memo(LeyendaOverlayComponent);
