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
import planoBaja from './assets/PG1-PlantaBaja.jpg';
import planoIntermedia from './assets/PG2-Planta Intermedia.jpg';
import planoPrimera from './assets/PG3-Planta Primera.jpg';
import planoSegunda from './assets/PG4-Planta Segunda.jpg';
import planoCubierta from './assets/PG5-Planta cubierta.jpg';
import aulasData from './data/aulas.json';

function App() {
  const imageWidth = 7017;
  const imageHeight = 4963;
  const imageBounds = [[0, 0], [imageHeight, imageWidth]];
  const [aulaActiva, setAulaActiva] = useState(null);
  const [plantaSeleccionada, setPlantaSeleccionada] = useState('Planta Baja');

  const planos = {
    'Planta Baja': planoBaja,
    'Planta Intermedia': planoIntermedia,
    'Planta Primera': planoPrimera,
    'Planta Segunda': planoSegunda,
    'Planta Cubierta': planoCubierta
  };

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

  const aulas = aulasData[plantaSeleccionada];

  return (
    <div className="App">
      <header className="app-header">
        <h1>El monje en Apuros</h1>
        <select
          value={plantaSeleccionada}
          onChange={(e) => setPlantaSeleccionada(e.target.value)}
          style={{
            padding: '0.5rem',
            fontSize: '1rem',
            marginTop: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}
        >
          {Object.keys(planos).map((planta) => (
            <option key={planta} value={planta}>
              {planta}
            </option>
          ))}
        </select>
      </header>

      <MapContainer
        crs={CRS.Simple}
        bounds={imageBounds}
        minZoom={-3}
        maxZoom={1}
        style={{ width: '100%', height: 'calc(100vh - 80px)'}}
        whenCreated={(map) => map.fitBounds(imageBounds)}
      >
        <ImageOverlay url={planos[plantaSeleccionada]} bounds={imageBounds} />

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