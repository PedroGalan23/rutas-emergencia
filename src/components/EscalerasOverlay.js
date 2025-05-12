// src/components/EscalerasOverlay.js
// Componente que renderiza los marcadores de escaleras y gestiona la navegación entre plantas al hacer clic

import React from "react";
import { Marker } from "react-leaflet";
import { escaleras } from "../constants/AppConstants";
import { createEscaleraMarkerIcon } from "../utils/mapUtils";

export function EscalerasOverlay({ plantaSeleccionada, setPlantaSeleccionada, setAulaActiva, resetRoute }) {
  return (
    <>
      {escaleras
        .filter((escalera) => {
          // No mostrar ninguna escalera en la planta Palomar
          if (plantaSeleccionada === "Planta Palomar") return false;
          // Las escaleras 6 y 7 solo se muestran en Planta Primera y Segunda
          if (escalera.id === "escalera6" || escalera.id === "escalera7") {
            return plantaSeleccionada === "Planta Primera" || plantaSeleccionada === "Planta Segunda";
          }
          // Las escaleras 1, 3 y 4 no se muestran en Planta Segunda
          if (["escalera1", "escalera3", "escalera4"].includes(escalera.id)) {
            return plantaSeleccionada !== "Planta Segunda";
          }
          return true;
        })
        .map((escalera) => {
          // Determinar a qué planta lleva la escalera cuando se hace clic
          const destino =
            escalera.id === "escalera6" || escalera.id === "escalera7"
              ? "Planta Primera"
              : "Planta Baja";
          return (
            <Marker
              key={escalera.id}
              position={escalera.coordenadas}
              icon={createEscaleraMarkerIcon()}
              eventHandlers={{
                click: () => {
                  if (plantaSeleccionada !== destino) {
                    setPlantaSeleccionada(destino);
                  }
                  if (resetRoute) resetRoute();
                  setAulaActiva(escalera);
                },
              }}
            />
          );
        })}
    </>
  );
}
