// src/hooks/useUrlParams.js
// Hook para sincronizar el estado inicial de la aplicación con los parámetros de la URL

import { useEffect } from "react";

export function useUrlParams(plantaSeleccionada, aulasData, setPlantaSeleccionada, setAulaActiva) {
  // Leer el parámetro de planta de la URL al montarse la aplicación
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const plantaParam = searchParams.get("planta");
    if (plantaParam) {
      setPlantaSeleccionada(plantaParam);
    }
  }, [setPlantaSeleccionada]);

  // Actualizar el aula activa según el parámetro 'id' de la URL (después de cargar los datos)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const aulaParam = searchParams.get("id");
    if (aulaParam && aulasData[plantaSeleccionada]) {
      const aulaPreseleccionada = aulasData[plantaSeleccionada]?.find(
        (aula) => aula.id === aulaParam
      );
      if (aulaPreseleccionada) {
        setAulaActiva(aulaPreseleccionada);
      }
    }
  }, [plantaSeleccionada, aulasData, setAulaActiva]);
}
