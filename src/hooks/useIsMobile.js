// src/hooks/useIsMobile.js
// Hook personalizado para detectar si la vista actual es de móvil según el ancho de la ventana

import { useState, useEffect } from "react";
import { MOBILE_BREAKPOINT } from "../constants/AppConstants";

export function useIsMobile() {
  // Estado que indica si la aplicación se muestra en un dispositivo móvil (ancho <= MOBILE_BREAKPOINT)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  useEffect(() => {
    // Actualizar el estado cuando la ventana cambia de tamaño
    function onResize() {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return isMobile;
}
