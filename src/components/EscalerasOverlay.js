// src/components/EscalerasOverlay.js
// Componente que renderiza los marcadores de escaleras en el mapa y permite cambiar de planta al hacer clic sobre ellos

import React from "react";
import { Marker } from "react-leaflet"; // Componente de Leaflet para representar marcadores
import { escaleras } from "../constants/AppConstants"; // Lista de escaleras y sus coordenadas
import { createEscaleraMarkerIcon } from "../utils/mapUtils"; // Función que devuelve el icono personalizado para escaleras

/**
 * Componente EscalerasOverlay
 * Representa las escaleras visibles en la planta actual y gestiona el cambio de planta al hacer clic en una de ellas.
 *
 * @param {string} plantaSeleccionada - Planta actualmente mostrada en el mapa.
 * @param {function} setPlantaSeleccionada - Función para cambiar la planta activa.
 * @param {function} setAulaActiva - Función para seleccionar el marcador (en este caso, la escalera clicada).
 * @param {function|null} resetRoute - Función opcional para limpiar rutas activas al cambiar de planta.
 */
export function EscalerasOverlay({ plantaSeleccionada, setPlantaSeleccionada, setAulaActiva, resetRoute }) {
  return (
    <>
      {escaleras
        .filter((escalera) => {
          // Regla 1: No mostrar escaleras en "Planta Palomar"
          if (plantaSeleccionada === "Planta Palomar") return false;

          // Regla 2: Escaleras 6 y 7 solo se muestran en "Planta Primera" y "Planta Segunda"
          if (["escalera6", "escalera7"].includes(escalera.id)) {
            return plantaSeleccionada === "Planta Primera" || plantaSeleccionada === "Planta Segunda";
          }

          // Regla 3: Escaleras 1, 3 y 4 no se muestran en "Planta Segunda"
          if (["escalera1", "escalera3", "escalera4"].includes(escalera.id)) {
            return plantaSeleccionada !== "Planta Segunda";
          }

          // En todos los demás casos, mostrar la escalera
          return true;
        })
        .map((escalera) => {
          // Definir destino según el tipo de escalera
          const destino =
            escalera.id === "escalera6" || escalera.id === "escalera7"
              ? "Planta Primera"
              : "Planta Baja";

          return (
            <Marker
              key={escalera.id}
              position={escalera.coordenadas}
              icon={createEscaleraMarkerIcon()} // Icono personalizado
              eventHandlers={{
                click: () => {
                  // Cambiar de planta si el destino es distinto al actual
                  if (plantaSeleccionada !== destino) {
                    setPlantaSeleccionada(destino);
                  }
                  // Limpiar ruta activa si hay función disponible
                  if (resetRoute) resetRoute();
                  // Seleccionar la escalera como "aula activa" para resaltado o tooltip
                  setAulaActiva(escalera);
                },
              }}
            />
          );
        })}
    </>
  );
}
