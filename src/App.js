import React, { useState } from 'react';
import {
  MapContainer,
  ImageOverlay,
  Rectangle,
  Polyline,
  Marker,
  useMapEvent
} from 'react-leaflet';
import { CRS, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import planoImg from './assets/PG1-PlantaBaja.jpg';
import aulasData from './data/aulas.json';

function App() {
  const imageWidth = 7017;
  const imageHeight = 4963;
  const imageBounds = [[0, 0], [imageHeight, imageWidth]];
  const [aulaActiva, setAulaActiva] = useState(null);

  const arrowIcon = divIcon({
    html: '⬅️',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: ''
  });

  // Clic sobre el mapa
  function ClickHandler({ aulas }) {
    useMapEvent('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log(`📍 Coordenadas clic: [${Math.round(lat)}, ${Math.round(lng)}]`);

      const aulaClicada = aulas.find(aula => {
        const y1 = aula.coordenadas.infDer[0];
        const y2 = aula.coordenadas.supIzq[0];
        const x1 = aula.coordenadas.supIzq[1];
        const x2 = aula.coordenadas.infDer[1];
        return lat >= y1 && lat <= y2 && lng >= x1 && lng <= x2;
      });

      setAulaActiva(aulaClicada || null);
    });
    return null;
  }

  const aulas = aulasData["Planta Baja"];

  return (
    <div className="App">
      <header style={{
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '1rem',
        textAlign: 'center',
        fontSize: '1.8rem',
        fontFamily: 'Segoe UI, sans-serif',
        letterSpacing: '1px'
      }}>
        El monje en Apuros
      </header>

      <MapContainer
        crs={CRS.Simple}
        bounds={imageBounds}
        minZoom={-3}
        maxZoom={1}
        style={{ width: '100%', height: '90vh' }}
        whenCreated={(map) => map.fitBounds(imageBounds)}
      >
        <ImageOverlay url={planoImg} bounds={imageBounds} />

        {/* Aulas (resaltadas dinámicamente al clic) */}
        {aulas.map((aula) => {
          const { coordenadas, color, id } = aula;
          const bounds = [coordenadas.infDer, coordenadas.supIzq];

          return (
            <Rectangle
              key={id}
              bounds={bounds}
              pathOptions={{
                color: aulaActiva?.id === id ? 'orange' : color,
                fillColor: aulaActiva?.id === id ? 'orange' : color,
                fillOpacity: 0.5,
                weight: aulaActiva?.id === id ? 4 : 2
              }}
            />
          );
        })}

        {/* Ruta y flechas */}
        {aulaActiva?.ruta && (
          <>
            <Polyline
              positions={aulaActiva.ruta}
              pathOptions={{ color: 'orange', weight: 4 }}
            />
            {aulaActiva.ruta.map((p, i) => (
              <Marker key={i} position={p} icon={arrowIcon} />
            ))}
          </>
        )}

        <ClickHandler aulas={aulas} />
      </MapContainer>
    </div>
  );
}

export default App;
