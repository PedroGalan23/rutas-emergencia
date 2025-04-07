import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  ImageOverlay,
  Rectangle,
  Marker,
  Tooltip,
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
import './App.css';

function App() {
  const imageWidth = 7017;
  const imageHeight = 4963;
  const imageBounds = [[0, 0], [imageHeight, imageWidth]];
  const [aulaActiva, setAulaActiva] = useState(null);
  const [plantaSeleccionada, setPlantaSeleccionada] = useState('Planta Baja');
  const [flechaPosicion, setFlechaPosicion] = useState(null);
  const flechaIndex = useRef(0);
  const animationRef = useRef(null);

  const planos = {
    'Planta Baja': planoBaja,
    'Planta Intermedia': planoIntermedia,
    'Planta Primera': planoPrimera,
    'Planta Segunda': planoSegunda,
    'Planta Cubierta': planoCubierta
  };

  function calcularAngulo(p1, p2) {
    const dx = p2[1] - p1[1];
    const dy = -(p2[0] - p1[0]); // Invertido por CRS.Simple
    const rad = Math.atan2(dy, dx);
    const deg = (rad * 180) / Math.PI;
    return deg;
  }

  function crearIconoFlecha(angle) {
    const size = 20;
    const color = 'orange';
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="0,0 100,50 0,100" fill="${color}" />
      </svg>
    `;
    return divIcon({
      html: `<div class="flecha-svg" style="transform: rotate(${angle}deg)">${svg}</div>`,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  useEffect(() => {
    if (!aulaActiva?.ruta) return;

    const ruta = aulaActiva.ruta;
    flechaIndex.current = 0;
    setFlechaPosicion(ruta[0]);

    const animate = () => {
      flechaIndex.current += 1;
      if (flechaIndex.current < ruta.length) {
        setFlechaPosicion(ruta[flechaIndex.current]);
        animationRef.current = setTimeout(animate, 300);
      }
    };

    animate();

    return () => clearTimeout(animationRef.current);
  }, [aulaActiva]);

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
    <div className="app">
      <header className="app-header">
        <h1>🧘‍♂️ El Monje en Apuros</h1>
        <div className="select-container">
          <label htmlFor="planta">Selecciona una planta:</label>
          <select
            id="planta"
            value={plantaSeleccionada}
            onChange={(e) => {
              setPlantaSeleccionada(e.target.value);
              setAulaActiva(null);
              setFlechaPosicion(null);
              clearTimeout(animationRef.current);
            }}
          >
            {Object.keys(planos).map((planta) => (
              <option key={planta} value={planta}>
                {planta}
              </option>
            ))}
          </select>
        </div>
      </header>

      <MapContainer
        crs={CRS.Simple}
        bounds={imageBounds}
        minZoom={-3}
        maxZoom={1}
        style={{ width: '100%', height: 'calc(100vh - 100px)' }}
        whenCreated={(map) => map.fitBounds(imageBounds)}
      >
        <ImageOverlay url={planos[plantaSeleccionada]} bounds={imageBounds} />

        {aulas.map((aula) => {
          const { coordenadas, color, id, nombre } = aula;
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
            interactive={true}
          >
            <Tooltip
              direction="top"
              offset={[0, -8]}
              opacity={1}
              sticky
              interactive
            >
              {nombre}
            </Tooltip>
          </Rectangle>
          
          );
        })}

        {aulaActiva?.ruta &&
          aulaActiva.ruta.slice(0, -1).map((p, i) => {
            const siguiente = aulaActiva.ruta[i + 1];
            const angulo = calcularAngulo(p, siguiente);
            return (
              <Marker key={i} position={p} icon={crearIconoFlecha(angulo)} />
            );
          })}

        {flechaPosicion && aulaActiva?.ruta && flechaIndex.current < aulaActiva.ruta.length && (
          <Marker
            position={flechaPosicion}
            icon={divIcon({
              html: `<div class="flecha-lider">🚶‍♂️</div>`,
              className: '',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          />
        )}

        <ClickHandler aulas={aulas} />
      </MapContainer>
    </div>
  );
}

export default App;
