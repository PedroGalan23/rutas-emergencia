// src/components/AulasLayer.js
// Componente que renderiza visualmente todas las aulas de una planta mediante rectángulos sobre el mapa Leaflet

import React from "react";
import { Rectangle, Tooltip } from "react-leaflet"; // Componentes de Leaflet para renderizar formas y tooltips
import { calcularCentro } from "../utils/mapUtils"; // Función auxiliar para calcular el centro de un rectángulo
import { EtiquetaAula } from "./EtiquetaAula"; // Componente personalizado para mostrar etiquetas encima de las aulas

/**
 * Componente AulasLayer
 * Renderiza todas las aulas de la planta actual mediante rectángulos y etiquetas de grupo.
 *
 * @param {Array} aulas - Lista de objetos que representan cada aula, con propiedades como id, nombre, coordenadas, grupo, color, etc.
 * @param {Object|null} aulaActiva - Aula actualmente seleccionada por el usuario (puede ser null)
 */
export function AulasLayer({ aulas, aulaActiva }) {
  return (
    <>
      {aulas.map((aula) => {
        // Determina si el aula es la actualmente activa
        const isActive = aula.id === aulaActiva?.id;

        // Determina si el aula es una coordinadora del mismo sector que el aula activa (si hay una seleccionada)
        const isCoordinator =
          aula.coordinadora && (!aulaActiva || aula.sector === aulaActiva.sector);

        // Establece la opacidad del fondo: si hay aula activa, solo se resaltan esa y su coordinadora
        const fillOpacity = aulaActiva
          ? isActive || isCoordinator
            ? 0.5
            : 0
          : 0.65;

        // Color del borde del rectángulo (morado si es activa, rojo si es coordinadora, otro color si no)
        const borderColor = isActive
          ? "purple"
          : isCoordinator
          ? "red"
          : aula.color;

        // Color de relleno del rectángulo
        const fillColor = isActive ? "purple" : aula.color;

        // Grosor del borde del rectángulo
        const weight = 4;

        // Coordenadas de esquina inferior derecha y superior izquierda en Leaflet
        const bounds = [aula.coordenadas.infDer, aula.coordenadas.supIzq];

        // Coordenadas del punto central (para mostrar la etiqueta de grupo encima del aula)
        const centro = calcularCentro(aula.coordenadas);

        return (
          <React.Fragment key={aula.id}>
            {/* Rectángulo representando el aula en el mapa */}
            <Rectangle
              bounds={bounds}
              pathOptions={{ color: borderColor, fillColor, fillOpacity, weight }}
              interactive={true}
            >
              {/* Tooltip emergente al pasar el cursor (nombre del aula) */}
              <Tooltip direction="top" offset={[0, -8]} sticky>
                {aula.nombre}
              </Tooltip>
            </Rectangle>

            {/* Etiqueta con información del grupo */}
            <EtiquetaAula position={centro} id={aula.id} grupo={aula.grupo} />
          </React.Fragment>
        );
      })}
    </>
  );
}
