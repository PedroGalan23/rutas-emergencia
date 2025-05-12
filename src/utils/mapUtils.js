// src/utils/mapUtils.js
// Funciones utilitarias para cálculos geométricos y creación de iconos en el mapa

import { divIcon } from "leaflet";
import { escaleras2 } from "../constants/AppConstants";

/**
 * Calcula el ángulo (en grados) entre dos puntos de coordenadas en el plano.
 * @param {Array<number>} p1 - Primer punto [lat, lng].
 * @param {Array<number>} p2 - Segundo punto [lat, lng].
 * @returns {number} Ángulo en grados de p1 a p2.
 */
export function calcularAngulo(p1, p2) {
  const dx = p2[1] - p1[1];
  const dy = -(p2[0] - p1[0]);
  const rad = Math.atan2(dy, dx);
  const deg = (rad * 180) / Math.PI;
  return deg;
}

/**
 * Calcula el punto central de un rectángulo definido por coordenadas opuestas.
 * @param {Object} coordenadas - Objeto con supIzq e infDer como esquinas opuestas.
 * @returns {Array<number>} Coordenadas [lat, lng] del centro del rectángulo.
 */
export function calcularCentro(coordenadas) {
  const centroY = (coordenadas.supIzq[0] + coordenadas.infDer[0]) / 2;
  const centroX = (coordenadas.supIzq[1] + coordenadas.infDer[1]) / 2;
  return [centroY, centroX];
}

/**
 * Crea un icono personalizado para las escaleras usando una imagen PNG.
 * @returns {DivIcon} Icono Leaflet para marcar la ubicación de una escalera.
 */
export function createEscaleraMarkerIcon() {
  return divIcon({
    html: `<img src="${escaleras2}" alt="Escalera" style="width:35px; height:35px;" />`,
    className: "",
    iconAnchor: [15, 15],
  });
}

/**
 * Crea un icono SVG de una flecha orientada en un cierto ángulo y color.
 * @param {number} angle - Ángulo de rotación de la flecha en grados.
 * @param {string} [color="orange"] - Color de la flecha (por defecto naranja).
 * @returns {DivIcon} Icono Leaflet con la flecha rotada.
 */
export function crearIconoFlecha(angle, color = "orange") {
  const size = 30;
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
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
