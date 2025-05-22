// src/hooks/useUrlParams.js
// Hook para sincronizar el estado inicial de la aplicación con los parámetros de la URL

import { useEffect } from "react";

export function useUrlParams(
  plantaSeleccionada,
  aulasData,
  setPlantaSeleccionada,
  setAulaActiva
) {
  // Al montar por primera vez, leer el parámetro "planta" de la URL
  // y, si existe, actualizar el estado de plantaSeleccionada
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const plantaParam = searchParams.get("planta");
    if (plantaParam) {
      setPlantaSeleccionada(plantaParam);
    }
  }, [setPlantaSeleccionada]);

  // Tras cualquier cambio en plantaSeleccionada o en los datos de aulas,
  // leer el parámetro "id" de la URL y, si corresponde a un aula válida,
  // actualizar el estado de aulaActiva
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const aulaParam = searchParams.get("id");
    if (aulaParam && aulasData[plantaSeleccionada]) {
      const aulaPreseleccionada = aulasData[plantaSeleccionada].find(
        (aula) => aula.id === aulaParam
      );
      if (aulaPreseleccionada) {
        setAulaActiva(aulaPreseleccionada);
      }
    }
  }, [plantaSeleccionada, aulasData, setAulaActiva]);
}
