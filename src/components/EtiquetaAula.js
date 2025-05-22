// src/components/EtiquetaAula.js
// Componente que renderiza una etiqueta de texto no interactiva sobre el mapa para identificar aulas

import React from "react";
import { Marker, useMap } from "react-leaflet"; // Marker para colocar la etiqueta, useMap para acceder al estado del mapa
import { divIcon } from "leaflet"; // Utilidad de Leaflet para crear iconos HTML personalizados

/**
 * Componente EtiquetaAula
 * Representa una etiqueta textual (id o grupo del aula) centrada en la posición del aula y escalada con el zoom del mapa.
 *
 * @param {Array} position - Coordenadas [lat, lng] del centro del aula.
 * @param {string} id - Identificador del aula (usado como texto si no hay grupo).
 * @param {string|null} grupo - Nombre del grupo (preferido como texto si existe).
 */
export function EtiquetaAula({ position, id, grupo }) {
  const map = useMap(); // Obtener el objeto del mapa actual
  const zoom = map.getZoom(); // Obtener el nivel de zoom actual

  // Calcular un factor de escala que depende del zoom. Se usa para que la etiqueta crezca/disminuya proporcionalmente.
  const baseScale = Math.pow(1.5, zoom); // Escala base (crece exponencialmente)
  const scale = Math.max(baseScale, 0.7); // Limitar un valor mínimo para que no desaparezca con zoom bajo

  // El texto mostrado será el grupo si está definido; si no, se muestra el id del aula
  const textoEtiqueta = grupo || id;

  // Marker no interactivo (no capta clics), que renderiza HTML personalizado
  return (
    <Marker
      position={position}
      icon={divIcon({
        html: `
        <div class="label-aula-mejorada" style="transform: translate(-50%, -50%) scale(${scale});">
          ${textoEtiqueta}
        </div>
      `,
        className: "", // Se deja vacío para que solo se apliquen estilos inline o globales
        iconAnchor: [0, 0], // Anclaje en la esquina superior izquierda
      })}
      interactive={false} // No responde a clics ni eventos
    />
  );
}
