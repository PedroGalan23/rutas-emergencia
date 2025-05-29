// src/hooks/useUrlParams.js
// Hook para sincronizar el estado inicial de la aplicación con el parámetro 'id' de la URL

import { useEffect } from "react";

export function useUrlParams(plantaSeleccionada, aulasData, setPlantaSeleccionada, setAulaActiva) {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const aulaParam = searchParams.get("id");
    if (!aulaParam) return;

    // Buscar el aula en todas las plantas
    for (const [planta, aulas] of Object.entries(aulasData)) {
      const aulaEncontrada = aulas.find((aula) => aula.id === aulaParam);
      if (aulaEncontrada) {
        setPlantaSeleccionada(planta);
        setAulaActiva(aulaEncontrada);
        break;
      }
    }
  }, [aulasData, setPlantaSeleccionada, setAulaActiva]);
}
