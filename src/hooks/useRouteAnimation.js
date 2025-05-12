// src/hooks/useRouteAnimation.js
// Hook para controlar la animación de la flecha indicando la ruta de evacuación

import { useState, useEffect, useRef } from "react";

export function useRouteAnimation(aulaActiva) {
  // Estado con la posición actual de la flecha en la ruta
  const [flechaPosicion, setFlechaPosicion] = useState(null);
  // Referencias para índice de paso de ruta y el intervalo de animación
  const flechaIndexRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Si no hay ruta activa, limpiar cualquier animación existente
    if (!aulaActiva?.ruta) {
      setFlechaPosicion(null);
      return;
    }
    const ruta = aulaActiva.ruta;
    // Iniciar desde el primer punto de la ruta
    flechaIndexRef.current = 0;
    setFlechaPosicion(ruta[0]);
    // Intervalo para mover la flecha por los puntos de la ruta
    intervalRef.current = setInterval(() => {
      flechaIndexRef.current = (flechaIndexRef.current + 1) % ruta.length;
      setFlechaPosicion(ruta[flechaIndexRef.current]);
    }, 300);
    // Al cambiar de ruta o desmontar, limpiar el intervalo
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [aulaActiva]);

  // Función para resetear la animación manualmente (por ejemplo, al cambiar de planta)
  function resetRoute() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setFlechaPosicion(null);
  }

  return { flechaPosicion, resetRoute };
}
