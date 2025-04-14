// App.js
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  MapContainer,
  ImageOverlay,
  Rectangle,
  Marker,
  Tooltip,
  useMapEvent,
  useMap
} from 'react-leaflet';
import { CRS, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { QRCodeCanvas } from 'qrcode.react';

import monjeEscalera from './assets/monje-escalera.png';
import monjeBombero from './assets/monjeBombero.png';
import salidasEmergencia from './data/salidasEmergencia.json';
import planoBaja from './assets/PG1-PlantaBaja.jpg';
import planoIntermedia from './assets/PG2-Planta Intermedia.jpg';
import planoPrimera from './assets/PG3-Planta Primera.jpg';
import planoSegunda from './assets/PG4-Planta Segunda.jpg';
import planoCubierta from './assets/PG5-Planta cubierta.jpg';
import aulasData from './data/aulas.json';
import zonasComunesData from './data/zonasComunes.json';
import escaleraData from './data/escaleras.json'; // Crea este archivo JSON con la información de las escaleras.
import monje1 from './assets/monje1.png';
import monje2 from './assets/monje2.png';
import './App.css';

function App() {
  const imageWidth = 7017;
  const imageHeight = 4963;
  const imageBounds = [[0, 0], [imageHeight, imageWidth]];
  
  // Estados de la aplicación
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

  // Importa las escaleras (comunes a todas las plantas) desde el JSON.
  const escaleras = escaleraData;

  // Función para calcular el ángulo entre dos puntos.
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
    const baseScale = Math.pow(1.5, zoom);
    const scale = Math.max(baseScale, 0.7);
    return (
      <Marker
        position={position}
        icon={divIcon({
          html: `
            <div class="label-aula" style="transform: translate(-50%, -50%) scale(${scale});">
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
  
  // Configuración de estilo según tamaño.
  function obtenerEstilosEtiqueta(coordenadas) {
    const ancho = Math.abs(coordenadas.infDer[1] - coordenadas.supIzq[1]);
    const alto = Math.abs(coordenadas.infDer[0] - coordenadas.supIzq[0]);
    const anchoMinimo = 50;
    const altoMinimo = 20;
    if (ancho < anchoMinimo || alto < altoMinimo) {
      return `
        font-size: 8px;
        padding: 1px 3px;
        white-space: normal;
      `;
    }
    return `
      font-size: 12px;
      padding: 2px 5px;
      white-space: normal;
    `;
  }

  // Función para crear el icono del marcador de escalera utilizando la imagen monjeEscalera.
  function createEscaleraMarkerIcon() {
    return divIcon({
      html: `<img src="${monjeEscalera}" alt="Escalera" style="width:30px; height:30px;" />`,
      className: '',
      iconAnchor: [15, 15]
    });
  }
  
  function crearIconoFlecha(angle, color = 'orange') {
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
  // Efecto para actualizar la planta seleccionada
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const plantaParam = searchParams.get('planta');
    if (plantaParam) {
      setPlantaSeleccionada(plantaParam);
    }
  }, []);

  // Efecto para actualizar el aula activa, en función de la planta seleccionada
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const aulaParam = searchParams.get('id');
    if (aulaParam) {
      const aulaPreseleccionada = aulasData[plantaSeleccionada]?.find(aula => aula.id === aulaParam);
      if (aulaPreseleccionada) {
        setAulaActiva(aulaPreseleccionada);
      }
    }
  }, [plantaSeleccionada]);

  // Animación del monje.
  useEffect(() => {
    const interval = setInterval(() => {
      setMonjeFrame((prev) => (prev + 1) % monjeFrames.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  // Animación de la flecha siguiendo la ruta activa.
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
  
  // Handler para detectar clics sobre las aulas.
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
  
  // Componente QrOverlay para mostrar el QR en coordenadas fijas.
  const QrOverlay = React.memo(function QrOverlay({ aulaActiva, plantaSeleccionada }) {
    const map = useMap();
    const overlayRef = useRef(null);
    const prevPointRef = useRef({ x: 0, y: 0 });
    const qrCoords = { supIzq: [719, 3556], infDer: [3, 5896] };
    const fixedCenter = {
      lat: (qrCoords.supIzq[0] + qrCoords.infDer[0]) / 2,
      lng: (qrCoords.supIzq[1] + qrCoords.infDer[1]) / 2
    };
    useLayoutEffect(() => {
      function updatePosition() {
        if (overlayRef.current) {
          const point = map.latLngToContainerPoint(fixedCenter);
          if (
            Math.abs(point.x - prevPointRef.current.x) < 1 &&
            Math.abs(point.y - prevPointRef.current.y) < 1
          ) {
            return;
          }
          overlayRef.current.style.left = `${point.x}px`;
          overlayRef.current.style.top = `${point.y}px`;
          prevPointRef.current = { x: point.x, y: point.y };
        }
      }
      map.on('zoomend moveend', updatePosition);
      updatePosition();
      return () => {
        map.off('zoomend moveend', updatePosition);
      };
    }, [map, fixedCenter]);
    if (!aulaActiva) return null;
    const url =
      window.location.origin +
      `?planta=${encodeURIComponent(plantaSeleccionada)}` +
      (aulaActiva ? `&id=${encodeURIComponent(aulaActiva.id)}` : '');
    return (
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          padding: '5px',
          border: '2px solid black',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <QRCodeCanvas value={url} size={60} style={{ marginRight: '8px' }} />
        <div style={{ fontSize: '12px', lineHeight: '1.2' }}>
          <strong>{aulaActiva.nombre}</strong>
          <br />
          ID: {aulaActiva.id}
          <br />
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: 'purple',
                borderRadius: '50%',
                marginRight: '4px'
              }}
            ></span>
            Usted está aquí
          </span>
        </div>
      </div>
    );
  });
  
  // Componente LeyendaOverlay para mostrar la leyenda en las coordenadas indicadas.
  const LeyendaOverlay = React.memo(function LeyendaOverlay({ plantaSeleccionada }) {
    const map = useMap();
    const overlayRef = useRef(null);
    const prevPointRef = useRef({ x: 0, y: 0 });
    const leyendaCoords = { supIzq: [1775, 128], infDer: [327, 1224] };
    const leyendaCenter = {
      lat: (leyendaCoords.supIzq[0] + leyendaCoords.infDer[0]) / 2,
      lng: (leyendaCoords.supIzq[1] + leyendaCoords.infDer[1]) / 2
    };
    useLayoutEffect(() => {
      function updatePosition() {
        if (overlayRef.current) {
          const point = map.latLngToContainerPoint(leyendaCenter);
          if (
            Math.abs(point.x - prevPointRef.current.x) < 1 &&
            Math.abs(point.y - prevPointRef.current.y) < 1
          ) {
            return;
          }
          overlayRef.current.style.left = `${point.x}px`;
          overlayRef.current.style.top = `${point.y}px`;
          prevPointRef.current = { x: point.x, y: point.y };
        }
      }
      map.on('zoomend moveend', updatePosition);
      updatePosition();
      return () => {
        map.off('zoomend moveend', updatePosition);
      };
    }, [map, leyendaCenter]);
    const currentAulas = aulasData[plantaSeleccionada] || [];
    const uniqueSectors = [];
    currentAulas.forEach((aula) => {
      if (!uniqueSectors.some(item => item.sector === aula.sector)) {
        uniqueSectors.push({ sector: aula.sector, color: aula.color });
      }
    });
    return (
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          padding: '10px',
          border: '2px solid black',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '200px'
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>Leyenda</div>
        {uniqueSectors.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
                display: 'inline-block',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                backgroundColor: item.color,
                marginRight: '6px'
              }}></span>
            <span>{item.sector}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={monjeBombero} alt="Salidas" style={{ height: '30px', marginRight: '6px' }} />
          <span>Salidas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={monjeEscalera} alt="Escaleras" style={{ height: '30px', marginRight: '6px' }} />
          <span>Escaleras</span>
        </div>
      </div>
    );
  });
  
  const aulas = aulasData[plantaSeleccionada];
  const zonasComunes = zonasComunesData[plantaSeleccionada] || [];

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <img
            src={monje2}
            alt="Monje"
            style={{ height: '1.8em', verticalAlign: 'middle', marginRight: '0.5em' }}
          />
          PLAN DE EVACUACIÓN
        </h1>
        <div className="controls">
          <div className="imprimible-container">
            <div className="switch-wrapper">
              <label className="switch">
                <input
                  type="checkbox"
                  id="imprimible"
                  checked={imprimible}
                  onChange={(e) => setImprimible(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="switch-label">Modo Impresión</span>
            </div>
          </div>
          <div className="selector-wrapper">
            <label htmlFor="planta" className="selector-label">Selecciona una planta:</label>
            <div className="custom-select">
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
              <span className="custom-arrow"></span>
            </div>
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
          {(salidasEmergencia[plantaSeleccionada] || []).map((salida, index) => (
            <Marker
              key={`salida-${index}`}
              position={salida.coordenadas}
              icon={divIcon({
                html: `<img src="${monjeBombero}" alt="Salida Emergencia" style="width:25px; height:25px;" />`,
                className: '',
                iconSize: [25, 25],
                iconAnchor: [10, 10]
              })}
              interactive={false}
            />
          ))}
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
                <EtiquetaAula position={centro} id={id} />
              </React.Fragment>
            );
          })}
          {zonasComunes.map((zona, index) => (
            <Marker
              key={zona.id || `zona-${index}`}
              position={zona.coordenadas}
              icon={divIcon({ html: '', className: '' })}
              interactive={false}
            >
              <Tooltip permanent direction="center" className="zona-tooltip" opacity={1}>
                <span style={{ display: 'inline-block', whiteSpace: 'pre-line' }}>
                  {zona.nombre}
                </span>
              </Tooltip>
            </Marker>
          ))}
          {/* Marcadores de las Escaleras */}
          {escaleras.map((escalera) => (
            <Marker
              key={escalera.id}
              position={escalera.coordenadas}
              icon={createEscaleraMarkerIcon()}
              eventHandlers={{
                click: () => {
                  if (plantaSeleccionada !== "Planta Baja") {
                    // Si no estás en la planta baja, cambia a Planta Baja sin mostrar ruta.
                    setPlantaSeleccionada("Planta Baja");
                    setAulaActiva(escalera);
                  } else {
                    // En la planta baja, al pulsar la escalera se muestra la ruta como aula normal.
                    setAulaActiva(escalera);
                  }
                }
              }}
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
                  icon={crearIconoFlecha(angulo, aulaActiva.color || 'blue')}
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
          <QrOverlay aulaActiva={aulaActiva} plantaSeleccionada={plantaSeleccionada} />
          <LeyendaOverlay plantaSeleccionada={plantaSeleccionada} />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
