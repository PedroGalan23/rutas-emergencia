// src/hooks/useAulasData.js
// Hook para cargar dinámicamente los datos de las aulas desde un archivo JSON externo

import { useState, useEffect } from "react";

export function useAulasData() {
  // Estado que almacenará el objeto con las aulas agrupadas por planta
  // Inicialmente se establece como un objeto vacío
  const [aulasData, setAulasData] = useState({});

  useEffect(() => {
    // Al montar el hook, realizar petición HTTP para obtener el JSON de aulas
    fetch("/data/aulas.json")
      .then((res) => {
        // Comprobar que la respuesta HTTP es exitosa (status 200–299)
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // Convertir el cuerpo de la respuesta a objeto JSON
        return res.json();
      })
      .then((data) => {
        // Actualizar el estado con los datos recibidos
        setAulasData(data);
      })
      .catch((err) => {
        // En caso de error, mostrar en consola (puede ampliarse para notificar al usuario)
        console.error("Error cargando aulas.json:", err);
      });
    // El array de dependencias vacío asegura que solo se ejecute una vez
  }, []);

  // Devolver los datos de las aulas al componente que lo invoque
  return aulasData;
}
