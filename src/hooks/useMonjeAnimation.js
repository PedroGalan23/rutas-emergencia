// src/hooks/useMonjeAnimation.js
// Hook para manejar la animación del monje (cambia de frame periódicamente)

import { useState, useEffect } from "react";

export function useMonjeAnimation(frames, interval = 500) {
  // Índice actual del fotograma del monje
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    // Crear un temporizador que actualiza el índice cada 'interval' milisegundos
    const intervalId = setInterval(() => {
      // Incrementar el índice de manera cíclica
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, interval);

    // Limpiar el temporizador al desmontar el hook
    return () => {
      clearInterval(intervalId);
    };
  }, [frames.length, interval]); // Reiniciar el efecto si cambia la longitud de frames o el intervalo

  // Devolver el índice del fotograma actual
  return currentFrame;
}
