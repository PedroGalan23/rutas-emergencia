// src/hooks/useMonjeAnimation.js
// Hook para manejar la animación del monje (cambia de frame periódicamente)

import { useState, useEffect } from "react";

export function useMonjeAnimation(frames, interval = 500) {
  // Estado con el índice actual del frame del monje
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Alternar el frame del monje en bucle
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [frames.length, interval]);

  return currentFrame;
}
