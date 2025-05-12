// src/components/AulasLayer.js
// Componente que renderiza todas las aulas (rectángulos y etiquetas) en la planta seleccionada

import React from "react";
import { Rectangle, Tooltip } from "react-leaflet";
import { calcularCentro } from "../utils/mapUtils";
import { EtiquetaAula } from "./EtiquetaAula";

export function AulasLayer({ aulas, aulaActiva }) {
  return (
    <>
      {aulas.map((aula) => {
        // Determinar el estado de cada aula (activa, coordinadora de sector, u ordinaria)
        const isActive = aula.id === aulaActiva?.id;
        const isCoordinator =
          aula.coordinadora && (!aulaActiva || aula.sector === aulaActiva.sector);

        // Estilos para el rectángulo según el estado
        const fillOpacity = aulaActiva
          ? isActive || isCoordinator
            ? 0.5
            : 0
          : 0.65;
        const borderColor = isActive
          ? "purple"
          : isCoordinator
          ? "red"
          : aula.color;
        const fillColor = isActive ? "purple" : aula.color;
        const weight = 4;

        // Coordenadas en formato [suroeste, noreste] para Rectangle
        const bounds = [aula.coordenadas.infDer, aula.coordenadas.supIzq];
        // Punto central del aula (para posicionar la etiqueta de texto)
        const centro = calcularCentro(aula.coordenadas);

        return (
          <React.Fragment key={aula.id}>
            <Rectangle
              bounds={bounds}
              pathOptions={{ color: borderColor, fillColor, fillOpacity, weight }}
              interactive={true}
            >
              <Tooltip direction="top" offset={[0, -8]} sticky>
                {aula.nombre}
              </Tooltip>
            </Rectangle>
            <EtiquetaAula position={centro} id={aula.id} grupo={aula.grupo} />
          </React.Fragment>
        );
      })}
    </>
  );
}
