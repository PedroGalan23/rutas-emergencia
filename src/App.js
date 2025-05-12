// src/App.js
// Archivo principal de la aplicación: importa los componentes y hooks, y arma la vista completa

import React, { useState } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Tooltip,
} from "react-leaflet";
import { CRS, divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

import { useIsMobile, useAulasData, useUrlParams, useMonjeAnimation, useRouteAnimation } from "./hooks";
import { calcularAngulo, crearIconoFlecha } from "./utils/mapUtils";
import { imageBounds, imagesSalida, monjeFrames, plantLabels, planos, salidasEmergencia, zonasComunesData } from "./constants/AppConstants";
import { AppHeader } from "./components/AppHeader";
import { AulasLayer } from "./components/AulasLayer";
import { EscalerasOverlay } from "./components/EscalerasOverlay";
import { ClickHandler } from "./components/ClickHandler";
import { QrOverlay } from "./components/QrOverlay";
import { LeyendaOverlay } from "./components/LeyendaOverlay";
import { SliderOverlay } from "./components/SliderOverlay";

import "./App.css";

function App() {
  // Estados principales de la aplicación
  const [aulaActiva, setAulaActiva] = useState(null);
  const [plantaSeleccionada, setPlantaSeleccionada] = useState("Planta Baja");
  const [imprimible, setImprimible] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [alertMessage, setAlertMessage] = useState(null);

  // Hooks personalizados para gestionar lógica de la aplicación
  const isMobile = useIsMobile();
  const aulasData = useAulasData();
  useUrlParams(plantaSeleccionada, aulasData, setPlantaSeleccionada, setAulaActiva);
  const monjeFrame = useMonjeAnimation(monjeFrames);
  const { flechaPosicion, resetRoute } = useRouteAnimation(aulaActiva);

  // Filtrado de aulas por planta seleccionada
  const todas = aulasData[plantaSeleccionada] || [];
  if (aulaActiva && todas.some((a) => a.id === aulaActiva.id)) {
    const sector = aulaActiva.sector;
    const coord = todas.filter((a) => a.sector === sector && a.coordinadora);
    if (!aulaActiva.coordinadora && coord.length > 0) {
      coord.push(aulaActiva);
    }
  }
  // Removed unused variable 'otras'
  const zonasComunes = zonasComunesData[plantaSeleccionada] || [];

  return (
    <div className="app">
      <AppHeader
        isMobile={isMobile}
        aulaActiva={aulaActiva}
        setSliderOpen={setSliderOpen}
        setSlideIndex={setSlideIndex}
        imprimible={imprimible}
        setImprimible={setImprimible}
        plantaSeleccionada={plantaSeleccionada}
        setPlantaSeleccionada={setPlantaSeleccionada}
        setAulaActiva={setAulaActiva}
        setAlertMessage={setAlertMessage}
      />
      <div className="map-container">
        <MapContainer
          crs={CRS.Simple}
          bounds={imageBounds}
          minZoom={-2.6}
          maxZoom={1}
          maxBounds={imageBounds}
          maxBoundsViscosity={1}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
          whenCreated={(map) => {
            map.fitBounds(imageBounds);
            map.dragging.disable();
          }}
        >
          {/* Imagen de fondo del plano de la planta seleccionada */}
          <ImageOverlay url={planos[plantaSeleccionada]} bounds={imageBounds} />
          {/* Marcadores de salidas de emergencia */}
          {salidasEmergencia[plantaSeleccionada]?.map((salida, i) => (
            <Marker
              key={i}
              position={salida.coordenadas}
              interactive={false}
              icon={divIcon({
                html: `<img src="${imagesSalida[salida.imagen]}" style="width:45px;height:45px" alt="Salida"/>`,
                className: "",
                iconSize: [25, 25],
                iconAnchor: [10, 10],
              })}
            />
          ))}
          {/* Aulas (rectángulos y etiquetas) */}
          <AulasLayer aulas={todas} aulaActiva={aulaActiva} />
          {/* Marcadores de zonas comunes (etiquetas permanentes) */}
          {zonasComunes.map((z, i) => (
            <Marker
              key={i}
              position={z.coordenadas}
              interactive={false}
              icon={divIcon({ html: "", className: "" })}
            >
              <Tooltip permanent direction="center" className="zona-tooltip">
                <span style={{ whiteSpace: "pre-line" }}>{z.nombre}</span>
              </Tooltip>
            </Marker>
          ))}
          {/* Marcadores de escaleras */}
          <EscalerasOverlay
            plantaSeleccionada={plantaSeleccionada}
            setPlantaSeleccionada={setPlantaSeleccionada}
            setAulaActiva={setAulaActiva}
            resetRoute={resetRoute}
          />
          {/* Ruta de flechas de evacuación */}
          {aulaActiva?.ruta?.slice(0, -1).map((p, i) => {
            const next = aulaActiva.ruta[i + 1];
            return (
              <Marker
                key={i}
                position={p}
                icon={crearIconoFlecha(calcularAngulo(p, next), aulaActiva.color)}
              />
            );
          })}
          {/* Icono animado del monje (solo se muestra si no es modo impresión) */}
          {!imprimible && flechaPosicion && aulaActiva?.ruta && (
            <Marker
              position={flechaPosicion}
              icon={divIcon({
                html: `<img src="${monjeFrames[monjeFrame]}" class="monje-animado" />`,
                className: "",
                iconSize: [40, 40],
                iconAnchor: [20, 20],
              })}
            />
          )}
          {/* Componente para manejar clics en el mapa */}
          <ClickHandler aulas={todas} onAulaSelect={setAulaActiva} />
          {/* Overlays de QR y leyenda */}
          <QrOverlay aulaActiva={aulaActiva} plantaSeleccionada={plantaSeleccionada} />
          <LeyendaOverlay plantaSeleccionada={plantaSeleccionada} aulasData={aulasData} />
        </MapContainer>
      </div>
      {/* Overlay de carrusel de fotos (slider) */}
      {sliderOpen && (
        <SliderOverlay
          aula={aulaActiva}
          slideIndex={slideIndex}
          setSlideIndex={setSlideIndex}
          onClose={() => setSliderOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
