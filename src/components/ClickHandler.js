// src/components/ClickHandler.js
// Componente invisible para capturar clics en el mapa y seleccionar aulas

import React from "react";
import { useMapEvent } from "react-leaflet";

export function ClickHandler({ aulas, onAulaSelect }) {
  // Capturar evento de clic en el mapa
  useMapEvent("click", (e) => {
    const { lat, lng } = e.latlng;
    console.log(`📍 Coordenadas clic: [${Math.round(lat)}, ${Math.round(lng)}]`);
    // Buscar si el clic cayó dentro de algún aula
    const aulaClicada = aulas.find((aula) => {
      const y1 = aula.coordenadas.infDer[0];
      const y2 = aula.coordenadas.supIzq[0];
      const x1 = aula.coordenadas.supIzq[1];
      const x2 = aula.coordenadas.infDer[1];
      return lat >= y1 && lat <= y2 && lng >= x1 && lng <= x2;
    });
    onAulaSelect(aulaClicada || null);
  });

  return null;
}
