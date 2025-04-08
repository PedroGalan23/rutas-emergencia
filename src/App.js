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
import zonasComunesData from './data/zonasComunes.json';
import monje1 from './assets/monje1.png';
import monje2 from './assets/monje2.png';
import escalerasIcon from './assets/escaleras.svg';
import './App.css';

function App() {
  const imageWidth = 7017;
  const imageHeight = 4963;
  const imageBounds = [[0, 0], [imageHeight, imageWidth]];
  const [aulaActiva, setAulaActiva] = useState(null);
  const [plantaSeleccionada, setPlantaSeleccionada] = useState('Planta Baja');
  const [flechaPosicion, setFlechaPosicion] = useState(null);
  const [monjeFrame, setMonjeFrame] = useState(0);
  const flechaIndex = useRef(0);
  const animationInterval = useRef(null);
  const monjeFrames = [monje1, monje2];

  const planos = {
    'Planta Baja': planoBaja,
    'Planta Intermedia': planoIntermedia,
    'Planta Primera': planoPrimera,
    'Planta Segunda': planoSegunda,
    'Planta Cubierta': planoCubierta
  };

  function calcularAngulo(p1, p2) {
    const dx = p2[1] - p1[1];
    const dy = -(p2[0] - p1[0]);
    const rad = Math.atan2(dy, dx);
    const deg = (rad * 180) / Math.PI;
    return deg;
  }

  function createEscalerasIcon() {
    return divIcon({
      html: `<img src="${escalerasIcon}" alt="Escaleras" style="width: 40px; height: 40px;" />`,
      className: '',
      iconAnchor: [20, 20]
    });
  }

  function crearIconoFlecha(angle, color = 'orange') {
    const size = 30;
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,50 L80,50 M80,50 L70,40 M80,50 L70,60"
              stroke="${color}" stroke-width="8" fill="none"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
    return divIcon({
      html: `<div class="flecha-svg" style="transform: rotate(${angle}deg)">${svg}</div>`,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  function createTextIcon(text) {
    const formattedText = text.replace(/\n/g, '<br>');
    return divIcon({
      html: `<div class="zona-label">${formattedText}</div>`,
      className: '',
      iconAnchor: [0, 0]
    });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setMonjeFrame((prev) => (prev + 1) % monjeFrames.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!aulaActiva?.ruta) return;

    const ruta = aulaActiva.ruta;
    flechaIndex.current = 0;
    setFlechaPosicion(ruta[0]);

    animationInterval.current = setInterval(() => {
      flechaIndex.current = (flechaIndex.current + 1) % ruta.length;
      setFlechaPosicion(ruta[flechaIndex.current]);
    }, 300);

    return () => clearInterval(animationInterval.current);
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
  const zonasComunes = zonasComunesData[plantaSeleccionada] || [];

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <img src={monje2} alt="Monje" style={{ height: '1.5em', verticalAlign: 'middle', marginRight: '0.5em' }} />
          PLAN DE INCENDIO
        </h1>
        <div className="select-container">
          <label htmlFor="planta">Selecciona una planta:</label>
          <select
            id="planta"
            value={plantaSeleccionada}
            onChange={(e) => {
              setPlantaSeleccionada(e.target.value);
              setAulaActiva(null);
              setFlechaPosicion(null);
              clearInterval(animationInterval.current);
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

      <div style={{ width: '100%', height: 'calc(100vh - 100px)', overflow: 'hidden', margin: 0 }}>
        <MapContainer
          crs={CRS.Simple}
          center={[imageHeight / 2, imageWidth / 2]}
          zoom={-2}
          minZoom={-2}
          maxZoom={1}
          maxBounds={imageBounds}
          maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%' }}
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
                  color: aulaActiva?.id === id ? 'purple' : color,
                  fillColor: aulaActiva?.id === id ? 'purple' : color,
                  fillOpacity: 0.5,
                  weight: aulaActiva?.id === id ? 4 : 2
                }}
                interactive={true}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1} sticky interactive>
                  {nombre}
                </Tooltip>
              </Rectangle>
            );
          })}

          {zonasComunes.map((zona, index) => (
            <Marker
              key={zona.id || `zona-${index}`}
              position={zona.coordenadas}
              icon={createTextIcon(zona.nombre)}
              interactive={false}
            />
          ))}

          {aulaActiva?.ruta &&
            aulaActiva.ruta.slice(0, -1).map((p, i) => {
              const siguiente = aulaActiva.ruta[i + 1];
              const angulo = calcularAngulo(p, siguiente);
              return (
                <Marker
                  key={i}
                  position={p}
                  icon={crearIconoFlecha(angulo, aulaActiva.color)}
                />
              );
            })}

          {flechaPosicion &&
            aulaActiva?.ruta && (
              <Marker
                position={flechaPosicion}
                icon={divIcon({
                  html: `<img src="${monjeFrames[monjeFrame]}" class="monje-animado" />`,
                  className: '',
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                })}
              />
            )}

          <ClickHandler aulas={aulas} />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
