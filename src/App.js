// src/App.js
// Archivo principal de la aplicación: importa componentes y hooks, y monta la vista completa sobre un mapa Leaflet

import React, { useState } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Tooltip,
} from "react-leaflet";
import { CRS, divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Importación de hooks personalizados
import {
  useIsMobile,
  useAulasData,
  useUrlParams,
  useMonjeAnimation,
  useRouteAnimation,
} from "./hooks";

// Utilidades para cálculos geométricos y creación de iconos
import { calcularAngulo, crearIconoFlecha } from "./utils/mapUtils";

// Constantes globales: planos, límites, imágenes y datos estáticos
import {
  imageBounds,
  imagesSalida,
  monjeFrames,
  planos,
  salidasEmergencia,
  zonasComunesData,
} from "./constants/AppConstants";

// Componentes de interfaz
import { AppHeader } from "./components/AppHeader";
import { AulasLayer } from "./components/AulasLayer";
import { EscalerasOverlay } from "./components/EscalerasOverlay";
import { ClickHandler } from "./components/ClickHandler";
import { QrOverlay } from "./components/QrOverlay";
import { LeyendaOverlay } from "./components/LeyendaOverlay";
import { SliderOverlay } from "./components/SliderOverlay";

import "./App.css";

function App() {
  // Estados principales
  const [aulaActiva, setAulaActiva] = useState(null);            // Aula actualmente seleccionada
  const [plantaSeleccionada, setPlantaSeleccionada] = useState("Planta Baja"); // Planta visible
  const [imprimible, setImprimible] = useState(false);           // Modo impresión activa
  const [sliderOpen, setSliderOpen] = useState(false);           // Visibilidad del slider de fotos
  const [slideIndex, setSlideIndex] = useState(0);               // Índice de foto en el slider

  // Obtención de lógica compartida mediante hooks
  const isMobile = useIsMobile();                                // Detecta si es dispositivo móvil
  const aulasData = useAulasData();                              // Carga datos de aulas por planta
  useUrlParams(
    plantaSeleccionada,
    aulasData,
    setPlantaSeleccionada,
    setAulaActiva
  );                                                             // Sincroniza estado con parámetros URL
  const monjeFrame = useMonjeAnimation(monjeFrames);             // Índice de fotograma animado del monje
  const { flechaPosicion, resetRoute } = useRouteAnimation(aulaActiva); // Posición y control de la flecha de ruta

  // Filtrar las aulas que corresponden a la planta seleccionada
  const todas = aulasData[plantaSeleccionada] || [];

  // Datos de zonas comunes para la planta actual
  const zonasComunes = zonasComunesData[plantaSeleccionada] || [];

  return (
    <div className="app">
      {/* Cabecera con título, controles de planta e impresión, y botón de slider */}
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
      />

      <div className="map-container">
        {/* Contenedor de mapa Leaflet con coordenadas simples */}
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
            map.fitBounds(imageBounds);     // Ajustar vista inicial
            map.dragging.disable();         // Desactivar arrastre para fijar el plano
          }}
        >
          {/* Fondo de plano correspondiente a la planta seleccionada */}
          <ImageOverlay url={planos[plantaSeleccionada]} bounds={imageBounds} />

          {/* Marcadores de salidas de emergencia (no interactivos) */}
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

          {/* Capa de aulas (rectángulos y etiquetas) */}
          <AulasLayer aulas={todas} aulaActiva={aulaActiva} />

          {/* Zonas comunes con tooltips permanentes */}
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

          {/* Overlay de escaleras y control de cambio de planta */}
          <EscalerasOverlay
            plantaSeleccionada={plantaSeleccionada}
            setPlantaSeleccionada={setPlantaSeleccionada}
            setAulaActiva={setAulaActiva}
            resetRoute={resetRoute}
          />

          {/* Ruta de evacuación: flechas orientadas entre puntos */}
          {aulaActiva?.ruta?.slice(0, -1).map((p, i) => {
            const next = aulaActiva.ruta[i + 1];
            return (
              <Marker
                key={i}
                position={p}
                icon={crearIconoFlecha(
                  calcularAngulo(p, next),
                  aulaActiva.color
                )}
              />
            );
          })}

          {/* Icono animado del monje en la posición actual de la ruta */}
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

          {/* Captura de clics en el mapa para seleccionar aulas */}
          <ClickHandler aulas={todas} onAulaSelect={setAulaActiva} />

          {/* Overlays de QR y leyenda */}
          <QrOverlay
            aulaActiva={aulaActiva}
            plantaSeleccionada={plantaSeleccionada}
          />
          <LeyendaOverlay
            plantaSeleccionada={plantaSeleccionada}
            aulasData={aulasData}
          />
        </MapContainer>
      </div>

      {/* Carrusel de fotos sobre el aula activa */}
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
