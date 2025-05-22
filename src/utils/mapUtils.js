// src/utils/mapUtils.js
// Funciones utilitarias para cálculos geométricos y creación de iconos en el mapa

import { divIcon } from "leaflet";
import { escaleras2 } from "../constants/AppConstants";

/**
 * Calcula el ángulo (en grados) entre dos puntos sobre el plano.
 * Se usa para orientar elementos gráficos (por ejemplo, flechas de ruta).
 *
 * @param {Array<number>} p1 - Primer punto [latitud, longitud].
 * @param {Array<number>} p2 - Segundo punto [latitud, longitud].
 * @returns {number} Ángulo en grados de p1 a p2, medido en sentido horario desde el eje X.
 */
export function calcularAngulo(p1, p2) {
  const dx = p2[1] - p1[1];          // Diferencia en longitud
  const dy = -(p2[0] - p1[0]);       // Diferencia en latitud invertida para sistema de coordenadas
  const rad = Math.atan2(dy, dx);    // Ángulo en radianes
  const deg = (rad * 180) / Math.PI; // Conversión a grados
  return deg;
}

/**
 * Calcula el punto central de un rectángulo definido por dos esquinas opuestas.
 * Se utiliza para posicionar etiquetas o marcadores en el centro de áreas (aulas, zonas).
 *
 * @param {Object} coordenadas - Objeto con propiedades:
 *   supIzq: [latitud, longitud] de la esquina superior izquierda.
 *   infDer: [latitud, longitud] de la esquina inferior derecha.
 * @returns {Array<number>} Coordenadas [latitud, longitud] del centro.
 */
export function calcularCentro(coordenadas) {
  const centroY = (coordenadas.supIzq[0] + coordenadas.infDer[0]) / 2;
  const centroX = (coordenadas.supIzq[1] + coordenadas.infDer[1]) / 2;
  return [centroY, centroX];
}

/**
 * Crea un icono personalizado para marcar la ubicación de una escalera en el mapa.
 * Utiliza una imagen PNG predefinida y establece el punto de anclaje en el centro.
 *
 * @returns {DivIcon} Instancia de DivIcon configurada para escaleras.
 */
export function createEscaleraMarkerIcon() {
  return divIcon({
    html: `<img src="${escaleras2}" alt="Escalera" style="width:35px; height:35px;" />`,
    className: "",            // Sin clases adicionales; se aplican estilos inline
    iconAnchor: [15, 15],     // Punto de anclaje centrado en el icono
  });
}

/**
 * Crea un icono SVG de una flecha orientada según un ángulo y color determinados.
 * Se emplea para indicar la dirección de la ruta de evacuación.
 *
 * @param {number} angle            - Ángulo de rotación en grados.
 * @param {string} [color="orange"] - Color del trazo de la flecha.
 * @returns {DivIcon} Instancia de DivIcon con la flecha SVG rotada.
 */
export function crearIconoFlecha(angle, color = "orange") {
  const size = 30;  // Tamaño en píxeles del icono
  const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,50 L80,50 M80,50 L70,40 M80,50 L70,60"
              stroke="black" stroke-width="16" fill="none"
              stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10,50 L80,50 M80,50 L70,40 M80,50 L70,60"
              stroke="${color}" stroke-width="14" fill="none"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  return divIcon({
    html: `<div class="flecha-svg" style="transform: rotate(${angle}deg)">${svg}</div>`,
    className: "",                    // Sin clases adicionales
    iconSize: [size, size],          // Dimensiones del contenedor del SVG
    iconAnchor: [size / 2, size / 2]  // Punto de anclaje centrado
  });
}
