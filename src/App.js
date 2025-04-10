// Importaciones de React, Leaflet y QRCode
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
import { useMap } from 'react-leaflet';
import { QRCodeCanvas } from 'qrcode.react';

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
  const [imprimible, setImprimible] = useState(false);

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

  function EtiquetaAula({ position, id }) {
    const map = useMap();
    const zoom = map.getZoom();

    // FACTOR BASE
    const baseScale = Math.pow(1.5, zoom); // puedes ajustar 1.3 a lo que veas mejor

    // ESCALA MÍNIMA PARA NO SER ENANA
    const scale = Math.max(baseScale, 0.7); // Nunca menor a 0.7

    return (
      <Marker
        position={position}
        icon={divIcon({
          html: `
            <div class="label-aula" style="
              transform: translate(-50%, -50%) scale(${scale});
            ">
              ${id}
            </div>
          `,
          className: '',
          iconAnchor: [0, 0]
        })}
        interactive={false}
      />
    );
  }



  function calcularCentro(coordenadas) {
    const centroY = (coordenadas.supIzq[0] + coordenadas.infDer[0]) / 2;
    const centroX = (coordenadas.supIzq[1] + coordenadas.infDer[1]) / 2;
    return [centroY, centroX];
  }

  // Ajusta según quieras: quita 'overflow' y 'text-overflow' para NO truncar
  function obtenerEstilosEtiqueta(coordenadas) {
    const ancho = Math.abs(coordenadas.infDer[1] - coordenadas.supIzq[1]);
    const alto = Math.abs(coordenadas.infDer[0] - coordenadas.supIzq[0]);
    const anchoMinimo = 50;
    const altoMinimo = 20;

    if (ancho < anchoMinimo || alto < altoMinimo) {
      return `
        font-size: 8px;
        padding: 1px 3px;
        white-space: normal;     /* <<< Permite saltos de línea si hace falta */
      `;
    }
    return `
      font-size: 12px;
      padding: 2px 5px;
      white-space: normal;       /* <<< No recorta */
    `;
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
        <!-- Borde negro -->
        <path d="M10,50 L80,50 M80,50 L70,40 M80,50 L70,60"
              stroke="black" stroke-width="16" fill="none"
              stroke-linecap="round" stroke-linejoin="round" />
        <!-- Trazo principal en color -->
        <path d="M10,50 L80,50 M80,50 L70,40 M80,50 L70,60"
              stroke="${color}" stroke-width="14" fill="none"
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
      const aulaClicada = aulas.find((aula) => {
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
          <img
            src={monje2}
            alt="Monje"
            style={{ height: '1.5em', verticalAlign: 'middle', marginRight: '0.5em' }}
          />
          PLAN DE INCENDIO
        </h1>
        <div className="controls">
          <div className="imprimible-container">
            <label htmlFor="imprimible">
              <input
                type="checkbox"
                id="imprimible"
                checked={imprimible}
                onChange={(e) => setImprimible(e.target.checked)}
              />
              Imprimible
            </label>
          </div>
          <div className="planta-container">
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
        </div>
      </header>

      <div className="map-container">
        <MapContainer
          crs={CRS.Simple}
          bounds={imageBounds}
          minZoom={-3}
          maxZoom={1}
          maxBounds={imageBounds}
          maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%' }}
          whenCreated={(map) => map.fitBounds(imageBounds)}
        >
          <ImageOverlay url={planos[plantaSeleccionada]} bounds={imageBounds} />

          {aulas.map((aula) => {
            const { coordenadas, color, id, nombre } = aula;
            const bounds = [coordenadas.infDer, coordenadas.supIzq];
            const centro = calcularCentro(coordenadas);

            return (
              <React.Fragment key={id}>
                <Rectangle
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

                {/* AQUÍ antes tenías el Marker de la etiqueta con divIcon manual */}
                {/* Lo cambias por esto: */}

                <EtiquetaAula position={centro} id={id} />

              </React.Fragment>
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

          {!imprimible && flechaPosicion && aulaActiva?.ruta && (
            <Marker
              position={flechaPosicion}
              icon={divIcon({
                html: `<img src="${monjeFrames[monjeFrame]}" class="monje-animado" alt="Monje animado" />`,
                className: '',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
              })}
            />
          )}

          <ClickHandler aulas={aulas} />
        </MapContainer>

        {aulaActiva && (
          <div className="info-panel">
            <table>
              <tbody>
                <tr>
                  <td className="qr-cell">
                    <QRCodeCanvas value={aulaActiva.id} size={80} />
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="location-info">
                      <span className="purple-circle"></span>
                      <span>Usted está aquí</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="aula-info">
                    {`ID: ${aulaActiva.id} - ${aulaActiva.nombre}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
