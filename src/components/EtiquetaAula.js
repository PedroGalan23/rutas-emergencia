// src/components/EtiquetaAula.js
// Componente de marcador de texto para identificar aulas en el mapa

import React from "react";
import { Marker, useMap } from "react-leaflet";
import { divIcon } from "leaflet";

export function EtiquetaAula({ position, id, grupo }) {
  const map = useMap();
  const zoom = map.getZoom();
  const baseScale = Math.pow(1.5, zoom);
  const scale = Math.max(baseScale, 0.7);
  const textoEtiqueta = grupo || id;

  // Marker no interactivo con un HTML personalizado que escala según el zoom del mapa
  return (
    <Marker
      position={position}
      icon={divIcon({
        html: `
        <div class="label-aula-mejorada" style="transform: translate(-50%, 
 -50%) scale(${scale});">
          ${textoEtiqueta}
        </div>
      `,
        className: "",
        iconAnchor: [0, 0],
      })}
      interactive={false}
    />
  );
}
