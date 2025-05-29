// src/hooks/useIsMobile.js
// Hook personalizado para detectar si la vista actual corresponde a un dispositivo móvil,
// basándose en el ancho de la ventana y un punto de corte definido en constantes.

import { useState, useEffect } from "react";
import { MOBILE_BREAKPOINT } from "../constants/AppConstants";

export function useIsMobile() {
  // Estado booleano que indica si el ancho de la ventana es menor o igual al breakpoint de móvil
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    // Función que actualiza el estado en cada cambio de tamaño de ventana
    function onResize() {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }

    // Registrar el listener de resize
    window.addEventListener("resize", onResize);

    // Limpiar el listener al desmontar el hook
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []); // Array de dependencias vacío: solo se registra una vez al montar

  // Devolver el valor actual de isMobile
  return isMobile;
}
