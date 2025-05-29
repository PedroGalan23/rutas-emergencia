// src/components/ClickHandler.js
// Componente invisible que escucha clics sobre el mapa de Leaflet y permite identificar si se ha pulsado sobre un aula

import { useMapEvent } from "react-leaflet"; // Hook para capturar eventos del mapa de Leaflet

/**
 * Componente ClickHandler
 * Se encarga de escuchar eventos de clic sobre el mapa y, si el clic cae dentro del área de un aula, la selecciona.
 *
 * @param {Array} aulas - Lista de objetos aula, cada uno con coordenadas (supIzq, infDer)
 * @param {Function} onAulaSelect - Función callback que se invoca al seleccionar un aula (o null si no se clicó ninguna)
 */
export function ClickHandler({ aulas, onAulaSelect }) {
  // Hook de React-Leaflet para capturar el evento de clic sobre el mapa
  useMapEvent("click", (e) => {
    // Extraer latitud y longitud del punto clicado
    const { lat, lng } = e.latlng;

    // Imprimir las coordenadas en consola para depuración
    console.log(`📍 Coordenadas clic: [${Math.round(lat)}, ${Math.round(lng)}]`);

    // Buscar si el clic está dentro de alguna de las aulas
    const aulaClicada = aulas.find((aula) => {
      const y1 = aula.coordenadas.infDer[0]; // latitud inferior
      const y2 = aula.coordenadas.supIzq[0]; // latitud superior
      const x1 = aula.coordenadas.supIzq[1]; // longitud izquierda
      const x2 = aula.coordenadas.infDer[1]; // longitud derecha

      // Verificar si el punto clicado está dentro del rectángulo del aula
      return lat >= y1 && lat <= y2 && lng >= x1 && lng <= x2;
    });

    // Notificar al componente superior qué aula fue seleccionada (o null si ninguna)
    onAulaSelect(aulaClicada || null);
  });

  // Este componente no renderiza nada en la interfaz
  return null;
}
