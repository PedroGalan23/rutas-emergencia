// src/hooks/useRouteAnimation.js
// Hook para controlar la animación de la flecha que indica la ruta de evacuación

import { useState, useEffect, useRef } from "react";

export function useRouteAnimation(aulaActiva) {
  // Estado que almacena la posición actual de la flecha sobre la ruta
  const [flechaPosicion, setFlechaPosicion] = useState(null);
  // Referencia al índice actual dentro del array de puntos de la ruta
  const flechaIndexRef = useRef(0);
  // Referencia al identificador del intervalo de animación
  const intervalRef = useRef(null);

  useEffect(() => {
    // Si no existe ruta en el aula activa, detener animación y limpiar estado
    if (!aulaActiva?.ruta) {
      setFlechaPosicion(null);
      return;
    }

    const ruta = aulaActiva.ruta;
    // Inicializar la flecha en el primer punto de la ruta
    flechaIndexRef.current = 0;
    setFlechaPosicion(ruta[0]);

    // Iniciar un intervalo que actualiza la posición de la flecha cada 300 ms
    intervalRef.current = setInterval(() => {
      flechaIndexRef.current = (flechaIndexRef.current + 1) % ruta.length;
      setFlechaPosicion(ruta[flechaIndexRef.current]);
    }, 300);

    // Al desmontar o cambiar de aulaActiva, limpiar el intervalo anterior
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [aulaActiva]);

  /**
   * Función para detener y reiniciar manualmente la animación.
   * Puede invocarse al cambiar de planta o al reiniciar la visualización.
   */
  function resetRoute() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setFlechaPosicion(null);
  }

  // Retornar la posición actual de la flecha y la función de reset
  return { flechaPosicion, resetRoute };
}
