// src/hooks/useAulasData.js
// Hook para cargar dinámicamente los datos de aulas desde el archivo JSON

import { useState, useEffect } from "react";

export function useAulasData() {
  // Estado que almacenará los datos de las aulas por planta (inicialmente vacío)
  const [aulasData, setAulasData] = useState({});

  useEffect(() => {
    // Realizar la petición para obtener el archivo JSON de aulas
    fetch("/data/aulas.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setAulasData(data);
      })
      .catch((err) => console.error("Error cargando aulas.json:", err));
  }, []);

  return aulasData;
}
