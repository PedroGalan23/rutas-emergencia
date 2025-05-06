// App.js
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  MapContainer,
  ImageOverlay,
  Rectangle,
  Marker,
  Tooltip,
  useMapEvent,
  Popup,
  useMap
} from 'react-leaflet';
import { CRS, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { QRCodeCanvas } from 'qrcode.react';

import escaleras2 from './assets/escaleras2.png';
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
import salidaAmarillo from './assets/salidaAmarillo.png';
import salidaVerde from './assets/salidaVerde.png';
import salidaAzul from './assets/salidaAzul.png';
import salidaLeyenda from './assets/salidaLeyenda.png';
import camerasData from './data/camaras.json';
import cameraIconPng from './assets/fotos/camara-fotografica.png';
import L from 'leaflet';


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

  const imagesSalida = {
    "src/assets/salidaAmarillo.png": salidaAmarillo,
    "src/assets/salidaVerde.png": salidaVerde,
    "src/assets/salidaAzul.png": salidaAzul
  };

  const cameraIcon = new L.Icon({
    iconUrl: cameraIconPng,
    iconSize: [20, 20],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: ''  // o añade estilos si lo necesitas
  });


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

  function EtiquetaAula({ position, id, grupo }) {
    const map = useMap();
    const zoom = map.getZoom();
    const baseScale = Math.pow(1.5, zoom);
    const scale = Math.max(baseScale, 0.7);

    const textoEtiqueta = grupo || id; // Si hay grupo lo muestra, si no muestra id

    return (
      <Marker
        position={position}
        icon={divIcon({
          html: `
            <div class="label-aula" style="transform: translate(-50%, -50%) scale(${scale});">
              ${textoEtiqueta}
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



  // Función para crear el icono del marcador de escalera utilizando la imagen escaleras2.
  function createEscaleraMarkerIcon() {
    return divIcon({
      html: `<img src="${escaleras2}" alt="Escalera" style="width:35px; height:35px;" />`,
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
  }, [monjeFrames.length]);

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
  // App.js (solo el QrOverlay)
  const QrOverlay = React.memo(function QrOverlay({ aulaActiva, plantaSeleccionada }) {
    const map = useMap();
    const overlayRef = useRef(null);
    const prevPointRef = useRef({ x: 0, y: 0 });
    const qrCoords = { supIzq: [652, 3011], infDer: [182, 4541] };
    const fixedCenter = {
      lat: (qrCoords.supIzq[0] + qrCoords.infDer[0]) / 2,
      lng: (qrCoords.supIzq[1] + qrCoords.infDer[1]) / 2
    };

    useLayoutEffect(() => {
      function updatePosition() {
        if (!overlayRef.current) return;
        const point = map.latLngToContainerPoint(fixedCenter);
        if (
          Math.abs(point.x - prevPointRef.current.x) < 1 &&
          Math.abs(point.y - prevPointRef.current.y) < 1
        ) {
          return;
        }

        const el = overlayRef.current;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const offsetX = -w / 2;
        const offsetY = -h / 2;

        el.style.transform = `translate3d(${point.x + offsetX}px, ${point.y + offsetY}px, 0)`;
        prevPointRef.current = { x: point.x, y: point.y };
      }

      map.on('zoomend moveend', updatePosition);
      updatePosition();
      return () => map.off('zoomend moveend', updatePosition);
    }, [map, fixedCenter]);

    if (!aulaActiva) return null;

    const url =
      window.location.origin +
      `?planta=${encodeURIComponent(plantaSeleccionada)}` +
      `&id=${encodeURIComponent(aulaActiva.id)}`;

    return (
      <div
        ref={overlayRef}
        className="qr-overlay"
        style={{
          position: 'absolute',
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
          <strong>{aulaActiva.grupo || aulaActiva.nombre}</strong>
          <br />
          ID: {aulaActiva.id}
          {aulaActiva.coordinadora && (
            <>
              <br />
              <strong style={{ color: 'red' }}>Aula Coordinadora</strong>
            </>
          )}
          <br />
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span
              className="legend-circleQR"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: 'purple',
                borderRadius: '50%',
                marginRight: '4px'
              }}
            />
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {/* en tu componente LeyendaOverlay */}
            <span
              className="legend-circle"
              style={{
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                backgroundColor: item.color,
                marginRight: '6px'
              }}
            ></span>

            <span>{item.sector}</span>
          </div>
        ))}


        {/* Nueva indicación para aulas coordinadoras */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="legend-square-coordinadora"
            style={{
              display: 'inline-block',
              width: '15px',
              height: '15px',
              backgroundColor: 'white',
              border: '2px solid red',
              marginRight: '6px'
            }}></span>

          <span>Aula Coordinadora</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={salidaLeyenda} alt="Salidas" style={{ height: '30px', marginRight: '6px' }} />
          <span>Salidas</span>
        </div>

        {/* Imagen 360º */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={cameraIconPng}
            alt="Imagen 360º"
            style={{ height: '25px', marginRight: '6px' }}
          />
          <span>Imagen 360º</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={escaleras2} alt="Escaleras" style={{ height: '30px', marginRight: '6px' }} />
          <span>Escaleras</span>
        </div>
      </div>
    );
  });


  // Filtrado de aulas
  const todas = aulasData[plantaSeleccionada] || [];
  let destacadas = [];

  // Sólo si aulaActiva viene de aulasData (no de escalera), calculamos destacadas
  if (aulaActiva && todas.some(a => a.id === aulaActiva.id)) {
    const sector = aulaActiva.sector;
    const coord = todas.filter(a => a.sector === sector && a.coordinadora);
    destacadas = aulaActiva.coordinadora
      ? coord
      : (coord.length > 0 ? [...coord, aulaActiva] : [aulaActiva]);
  }

  const otras = todas.filter(a => !destacadas.some(d => d.id === a.id));

  const zonasComunes = zonasComunesData[plantaSeleccionada] || [];

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <img src={monje2} alt="Monje" style={{ height: '1.8em', verticalAlign: 'middle', marginRight: '0.5em' }} />
          PLAN DE EVACUACIÓN
        </h1>
        <div className="controls">
          {/* Switch y texto alineados */}
          <div className="switch-wrapper">
            <label className="switch">
              <input
                type="checkbox"
                checked={imprimible}
                onChange={e => setImprimible(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <span className="switch-label">Modo Impresión</span>
          </div>

          {/* Selector de planta */}
          <div className="selector-wrapper">
            <label htmlFor="planta" className="selector-label">Selecciona una planta:</label>
            <div className="custom-select">
              <select
                id="planta"
                value={plantaSeleccionada}
                onChange={e => {
                  setPlantaSeleccionada(e.target.value);
                  setAulaActiva(null);
                  setFlechaPosicion(null);
                  clearInterval(animationInterval.current);
                }}
              >
                {Object.keys(planos).map(p => (
                  <option key={p} value={p}>{p}</option>
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
          minZoom={-2.6}
          maxZoom={1}
          maxBounds={imageBounds}
          maxBoundsViscosity={1}
          style={{ width: '100%', height: '100%' }}
          whenCreated={map => {
            map.fitBounds(imageBounds);
            map.dragging.disable();
          }}
        >
          <ImageOverlay url={planos[plantaSeleccionada]} bounds={imageBounds} />

          {/* Salidas de emergencia */}
          {salidasEmergencia[plantaSeleccionada]?.map((salida, i) => (
            <Marker
              key={i}
              position={salida.coordenadas}
              interactive={false}
              icon={divIcon({
                html: `<img src="${imagesSalida[salida.imagen]}" style="width:45px;height:45px" alt="Salida"/>`,
                className: '', iconSize: [25, 25], iconAnchor: [10, 10]
              })}
            />
          ))}

          {!imprimible && camerasData[plantaSeleccionada]?.map(cam => (
            <Marker
              key={cam.id}
              position={cam.coordenadas}
              icon={cameraIcon}
            >
              <Popup>
                {/* Requerimos dinámicamente la foto */}
                <img
                  src={require(`./assets/fotos/${cam.foto}`)}
                  alt={`Foto ${cam.id}`}
                  style={{ width: '200px', height: 'auto' }}
                />
              </Popup>
            </Marker>
          ))}
            {todas.map(a => {
              const isActive = a.id === aulaActiva?.id;
              const isCoordinator = a.coordinadora && (!aulaActiva || a.sector === aulaActiva.sector);

              // Estado de relleno: si no hay selección, todas al 0.5; si hay, sólo activa y coordinadoras
              const fillOpacity = aulaActiva
                ? (isActive || isCoordinator ? 0.5 : 0)
                : 0.65;

              // Color de borde: morado si activa, rojo si coordinadora, sector otherwise
              const borderColor = isActive
                ? 'purple'
                : isCoordinator
                  ? 'red'
                  : a.color;

              // Color de relleno: morado si activa, sector otherwise
              const fillColor = isActive
                ? 'purple'
                : a.color;

              // Grosor: 4 para activas y coordinadoras, 2 para el resto tras clic, 4 al inicio
              const weight = aulaActiva
                ? (isActive || isCoordinator ? 4 : 4)
                : 4;

              const bounds = [a.coordenadas.infDer, a.coordenadas.supIzq];
              const centro = calcularCentro(a.coordenadas);

              return (
                <React.Fragment key={a.id}>
                  <Rectangle
                    bounds={bounds}
                    pathOptions={{
                      color: borderColor,
                      fillColor,
                      fillOpacity,
                      weight
                    }}
                    interactive={true}  // ← siempre interactivo
                  >
                    <Tooltip
                      direction="top"
                      offset={[0, -8]}
                      sticky            // sigue al cursor cuando haces hover
                    >
                      {a.nombre}
                    </Tooltip>
                  </Rectangle>
                  <EtiquetaAula position={centro} id={a.id} grupo={a.grupo} />
                </React.Fragment>
              );
            })}


          


          {/* Zonas comunes */}
          {zonasComunes.map((z, i) => (
            <Marker key={i} position={z.coordenadas} interactive={false} icon={divIcon({ html: '', className: '' })}>
              <Tooltip permanent direction="center" className="zona-tooltip">
                <span style={{ whiteSpace: 'pre-line' }}>{z.nombre}</span>
              </Tooltip>
            </Marker>
          ))}

          {/* Marcadores de las Escaleras, ocultando escalera3 en Planta Intermedia */}
            {escaleras
              .filter(escalera =>
                !(plantaSeleccionada === 'Planta Segunda' && escalera.id === 'escalera3')
              )
              .map(escalera => (
                <Marker
                  key={escalera.id}
                  position={escalera.coordenadas}
                  icon={createEscaleraMarkerIcon()}
                  eventHandlers={{
                    click: () => {
                      if (plantaSeleccionada !== 'Planta Baja') {
                        setPlantaSeleccionada('Planta Baja');
                      }
                      setFlechaPosicion(null);
                      setAulaActiva(escalera);
                    }
                  }}
                />
              ))
            }





          {/* Ruta de flechas */}
          {aulaActiva?.ruta?.slice(0, -1).map((p, i) => {
            const next = aulaActiva.ruta[i + 1];
            return <Marker key={i} position={p} icon={crearIconoFlecha(calcularAngulo(p, next), aulaActiva.color)} />
          })}

          {/* Monje animado */}
          {!imprimible && flechaPosicion && aulaActiva?.ruta && (
            <Marker position={flechaPosicion} icon={divIcon({
              html: `<img src="${monjeFrames[monjeFrame]}" class="monje-animado"/>`,
              className: '', iconSize: [40, 40], iconAnchor: [20, 20]
            })} />
          )}

          <ClickHandler aulas={todas} />
          <QrOverlay aulaActiva={aulaActiva} plantaSeleccionada={plantaSeleccionada} />
          <LeyendaOverlay plantaSeleccionada={plantaSeleccionada} />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;