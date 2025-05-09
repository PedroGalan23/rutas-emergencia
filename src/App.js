import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  MapContainer,
  ImageOverlay,
  Rectangle,
  Marker,
  Tooltip,
  useMapEvent,
  Popup,
  useMap,
} from "react-leaflet";
import { CRS, divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { QRCodeCanvas } from "qrcode.react";

import escaleras2 from "./assets/escaleras2.png";
import salidasEmergencia from "./data/salidasEmergencia.json";
import planoBaja from "./assets/PG1-PlantaBaja.jpg";
import planoIntermedia from "./assets/PG2-Planta Intermedia.jpg";
import planoPrimera from "./assets/PG3-Planta Primera.jpg";
import planoSegunda from "./assets/PG4-Planta Segunda.jpg";
import planoPalomar from "./assets/Palomar.png";
import zonasComunesData from "./data/zonasComunes.json";
import escaleraData from "./data/escaleras.json"; // Crea este archivo JSON con la información de las escaleras.
import monje1 from "./assets/monje1.png";
import monje2 from "./assets/monje2.png";
import salidaAmarillo from "./assets/salidaAmarillo.png";
import salidaVerde from "./assets/salidaVerde.png";
import salidaAzul from "./assets/salidaAzul.png";
import salidaLeyenda from "./assets/salidaLeyenda.png";
import camerasData from "./data/camaras.json";
import cameraIconPng from "./assets/fotos/camara-fotografica.png";
import L from "leaflet";
import playIcon from "./assets/play.svg"; // tu icono de “play”

import "./App.css";

function App() {

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  const imageWidth = 7017;
  const imageHeight = 4963;
  const imageBounds = [
    [0, 0],
    [imageHeight, imageWidth],
  ];

  // Estados de la aplicación
  const [aulaActiva, setAulaActiva] = useState(null);
  const [plantaSeleccionada, setPlantaSeleccionada] = useState("Planta Baja");
  const [flechaPosicion, setFlechaPosicion] = useState(null);
  const [monjeFrame, setMonjeFrame] = useState(0);
  const [imprimible, setImprimible] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  // DATOS DE AULAS CARGADOS DINÁMICAMENTE
  const [aulasData, setAulasData] = useState({});


  // Cargar datos de aulas.json
  useEffect(() => {
    fetch("/data/aulas.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setAulasData)
      .catch((err) => console.error("Error cargando aulas.json:", err));
  }, []);


  // Detectar cambios de tamaño de la ventana
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);


  const imagesSalida = {
    "src/assets/salidaAmarillo.png": salidaAmarillo,
    "src/assets/salidaVerde.png": salidaVerde,
    "src/assets/salidaAzul.png": salidaAzul,
  };

  const cameraIcon = new L.Icon({
    iconUrl: cameraIconPng,
    iconSize: [20, 20],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: "",
  });

  const flechaIndex = useRef(0);
  const animationInterval = useRef(null);

  const monjeFrames = [monje1, monje2];

  const plantLabels = {
    "Planta Baja": "PB",
    "Planta Intermedia": "PE",
    "Planta Palomar": "PL",
    "Planta Primera": "P1",
    "Planta Segunda": "P2",
  };

  const planos = {
    "Planta Baja": planoBaja,
    "Planta Intermedia": planoIntermedia,
    "Planta Palomar": planoPalomar,
    "Planta Primera": planoPrimera,
    "Planta Segunda": planoSegunda,
  };


  const escaleras = escaleraData;

  // justo bajo tus imports:
  const fotosContext = require.context(
    "./assets/fotos",
    false,
    /\.(png|jpe?g|svg)$/
  );

  const fotosMap = fotosContext.keys().reduce((map, key) => {
    const filename = key.replace("./", "");
    map[filename] = fotosContext(key);
    return map;
  }, {});

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
    const textoEtiqueta = grupo || id;

    return (
      <Marker
        position={position}
        icon={divIcon({
          html: `
          <div class="label-aula-mejorada" style="transform: translate(-50%, -50%) scale(${scale});">
            ${textoEtiqueta}
          </div>
        `,
          className: "",
          iconAnchor: [0, 0],
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

  function createEscaleraMarkerIcon() {
    return divIcon({
      html: `<img src="${escaleras2}" alt="Escalera" style="width:35px; height:35px;" />`,
      className: "",
      iconAnchor: [15, 15],
    });
  }

  function crearIconoFlecha(angle, color = "orange") {
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
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  // Efecto para actualizar la planta seleccionada
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const plantaParam = searchParams.get("planta");
    if (plantaParam) {
      setPlantaSeleccionada(plantaParam);
    }
  }, []);

  // Efecto para actualizar el aula activa en base a la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const aulaParam = searchParams.get("id");

    if (aulaParam && aulasData[plantaSeleccionada]) {
      const aulaPreseleccionada = aulasData[plantaSeleccionada]?.find(
        (aula) => aula.id === aulaParam
      );
      if (aulaPreseleccionada) {
        setAulaActiva(aulaPreseleccionada);
      }
    }
  }, [plantaSeleccionada, aulasData]);


  // Animación del monje
  useEffect(() => {
    const interval = setInterval(() => {
      setMonjeFrame((prev) => (prev + 1) % monjeFrames.length);
    }, 500);
    return () => clearInterval(interval);
  }, [monjeFrames.length]);

  // Animación de la flecha siguiendo la ruta
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


  const QrOverlay = React.memo(function QrOverlay({
    aulaActiva,
    plantaSeleccionada,
  }) {
    const map = useMap();
    const overlayRef = useRef(null);
    const prevPointRef = useRef({ x: 0, y: 0 });
    const fixedCenter = React.useMemo(() => {
      const qrCoords = { supIzq: [652, 3011], infDer: [182, 4541] };
      return {
        lat: (qrCoords.supIzq[0] + qrCoords.infDer[0]) / 2,
        lng: (qrCoords.supIzq[1] + qrCoords.infDer[1]) / 2,
      };
    }, []);

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
        el.style.transform = `translate3d(${point.x + offsetX}px, ${point.y + offsetY
          }px, 0)`;
        prevPointRef.current = { x: point.x, y: point.y };
      }

      map.on("zoomend moveend", updatePosition);
      updatePosition();
      return () => map.off("zoomend moveend", updatePosition);
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
          position: "absolute",
          zIndex: 1000,
          padding: "5px",
          border: "2px solid black",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <QRCodeCanvas value={url} size={60} style={{ marginRight: "8px" }} />
        <div style={{ fontSize: "12px", lineHeight: "1.2" }}>
          <strong>{aulaActiva.grupo || aulaActiva.nombre}</strong>
          <br />
          ID: {aulaActiva.id}
          {aulaActiva.coordinadora && (
            <>
              <br />
              <strong style={{ color: "red" }}>Aula Coordinadora</strong>
            </>
          )}
          <br />
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <span
              className="legend-circleQR"
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "purple",
                borderRadius: "50%",
                marginRight: "4px",
              }}
            />
            Usted está aquí
          </span>
        </div>
      </div>
    );
  });

  const LeyendaOverlay = React.memo(function LeyendaOverlay({
    plantaSeleccionada,
  }) {
    const map = useMap();
    const overlayRef = useRef(null);
    const prevPointRef = useRef({ x: 0, y: 0 });
    const leyendaCenter = React.useMemo(() => {
      const leyendaCoords = { supIzq: [1775, 128], infDer: [327, 1224] };
      return {
        lat: (leyendaCoords.supIzq[0] + leyendaCoords.infDer[0]) / 2,
        lng: (leyendaCoords.supIzq[1] + leyendaCoords.infDer[1]) / 2,
      };
    }, []);

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
      map.on("zoomend moveend", updatePosition);
      updatePosition();
      return () => {
        map.off("zoomend moveend", updatePosition);
      };
    }, [map, leyendaCenter]);

    const currentAulas = aulasData[plantaSeleccionada] || [];
    const uniqueSectors = [];
    currentAulas.forEach((aula) => {
      if (!uniqueSectors.some((item) => item.sector === aula.sector)) {
        uniqueSectors.push({ sector: aula.sector, color: aula.color });
      }
    });

    return (
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          padding: "10px",
          border: "2px solid black",
          borderRadius: "5px",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxWidth: "200px",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            marginBottom: "4px",
            textAlign: "center",
          }}
        >
          LEYENDA
        </div>
        {uniqueSectors.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center" }}>
            <span
              className="legend-circle"
              style={{
                width: "15px",
                height: "15px",
                borderRadius: "50%",
                backgroundColor: item.color,
                marginRight: "6px",
              }}
            ></span>
            <span>{item.sector}</span>
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            className="legend-square-coordinadora"
            style={{
              display: "inline-block",
              width: "15px",
              height: "15px",
              backgroundColor: "white",
              border: "2px solid red",
              marginRight: "6px",
            }}
          ></span>
          <span>Aula Coordinadora</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={salidaLeyenda}
            alt="Salidas"
            style={{ height: "30px", marginRight: "6px" }}
          />
          <span>Salidas</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={cameraIconPng}
            alt="Imagen 360º"
            style={{ height: "25px", marginRight: "6px" }}
          />
          <span>Imagen 360º</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={escaleras2}
            alt="Escaleras"
            style={{ height: "30px", marginRight: "6px" }}
          />
          <span>Escaleras</span>
        </div>
      </div>
    );
  });

  // Filtrado de aulas
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
      <header className="app-header">
        {/* 2) H1: siempre mostramos la imagen, sólo el texto si NO es móvil */}
        <h1>
          <img
            src={monje2}
            alt="Monje"
            style={{
              height: "1.8em",
              verticalAlign: "middle",
              marginRight: "0.5em",
            }}
          />
          {!isMobile && "PLAN DE EVACUACIÓN"}
        </h1>
             {/* <-- aquí dentro, junto al selector */}
             {aulaActiva && (
                <button className="btn-play" onClick={() => setSliderOpen(true)}>
                  <img src={playIcon} alt="Ver ruta en fotos" />
                </button>
              )}       
        <div className="controls">
          {/* 3) Switch sólo si NO es móvil */}
          {!isMobile && (
            <div className="switch-wrapper">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={imprimible}
                  onChange={(e) => setImprimible(e.target.checked)}
                />
                <span className="slider round" />
              </label>
              <span className="switch-label">Modo Impresión</span>
            </div>
          )}

          {/* 4) Selector de planta siempre */}
          <div className="selector-wrapper">
            <label htmlFor="planta" className="selector-label">
              Selecciona una planta:
            </label>
            <div className="plant-selector">
              {Object.keys(planos).map((p) => (
                <button
                  key={p}
                  className={`plant-button ${plantaSeleccionada === p ? "active" : ""
                    }`}
                  onClick={() => {
                    setPlantaSeleccionada(p);
                    setAulaActiva(null);
                    setFlechaPosicion(null);
                    clearInterval(animationInterval.current);
                  }}
                >
                  {plantLabels[p]}
                </button>
              ))}
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
          attributionControl={false}  // <–– aquí
          style={{ width: "100%", height: "100%" }}
          whenCreated={(map) => {
            map.fitBounds(imageBounds);
            map.dragging.disable();
          }}
        >
          <ImageOverlay url={planos[plantaSeleccionada]} bounds={imageBounds} />

          {salidasEmergencia[plantaSeleccionada]?.map((salida, i) => (
            <Marker
              key={i}
              position={salida.coordenadas}
              interactive={false}
              icon={divIcon({
                html: `<img src="${imagesSalida[salida.imagen]
                  }" style="width:45px;height:45px" alt="Salida"/>`,
                className: "",
                iconSize: [25, 25],
                iconAnchor: [10, 10],
              })}
            />
          ))}


          {todas.map(a => {
            const isActive = a.id === aulaActiva?.id;
            const isCoordinator =
              a.coordinadora && (!aulaActiva || a.sector === aulaActiva.sector);

            const fillOpacity = aulaActiva
              ? isActive || isCoordinator
                ? 0.5
                : 0
              : 0.65;

            const borderColor = isActive
              ? "purple"
              : isCoordinator
                ? "red"
                : a.color;

            const fillColor = isActive ? "purple" : a.color;

            const weight = aulaActiva ? (isActive || isCoordinator ? 4 : 4) : 4;

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
                    weight,
                  }}
                  interactive={true}
                >
                  <Tooltip direction="top" offset={[0, -8]} sticky>
                    {a.nombre}
                  </Tooltip>
                </Rectangle>
                <EtiquetaAula position={centro} id={a.id} grupo={a.grupo} />
              </React.Fragment>
            );
          })}

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
          {/* Marcadores de las Escaleras */}
          {escaleras
            .filter(escalera => {
              // No mostrar escaleras en la planta Palomar
              if (plantaSeleccionada === "Planta Palomar") return false;

              // escalera6 y escalera7 solo en Primera y Segunda
              if (escalera.id === 'escalera6' || escalera.id === 'escalera7') {
                return plantaSeleccionada === 'Planta Primera' || plantaSeleccionada === 'Planta Segunda';
              }

              // escalera1, escalera3 y escalera4 NO en Planta Segunda
              if (['escalera1', 'escalera3', 'escalera4'].includes(escalera.id)) {
                return plantaSeleccionada !== 'Planta Segunda';
              }

              return true;
            })
            .map(escalera => (
              <Marker
                key={escalera.id}
                position={escalera.coordenadas}
                icon={createEscaleraMarkerIcon()}
                eventHandlers={{
                  click: () => {
                    const destino = (escalera.id === 'escalera6' || escalera.id === 'escalera7')
                      ? 'Planta Primera'
                      : 'Planta Baja';
                    if (plantaSeleccionada !== destino) {
                      setPlantaSeleccionada(destino);
                    }
                    setFlechaPosicion(null);
                    setAulaActiva(escalera);
                  },
                }}
              />
            ))
          }


          {/* Ruta de flechas */}
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

          {!imprimible && flechaPosicion && aulaActiva?.ruta && (
            <Marker
              position={flechaPosicion}
              icon={divIcon({
                html: `<img src="${monjeFrames[monjeFrame]}" class="monje-animado"/>`,
                className: "",
                iconSize: [40, 40],
                iconAnchor: [20, 20],
              })}
            />
          )}

          <ClickHandler aulas={todas} />
          <QrOverlay
            aulaActiva={aulaActiva}
            plantaSeleccionada={plantaSeleccionada}
          />
          <LeyendaOverlay plantaSeleccionada={plantaSeleccionada} />
        </MapContainer>
      </div>
      {sliderOpen && (
  <div className="slider-overlay" onClick={() => setSliderOpen(false)}>
    <div className="slider-content" onClick={e => e.stopPropagation()}>
      <button className="slider-close" onClick={() => setSliderOpen(false)}>×</button>
      {aulaActiva.fotos.map((f, i) => (
        <img
          key={i}
          src={fotosMap[f]}
          alt={`Punto ${i+1}`}
          className={`slider-img ${i === slideIndex ? 'active' : ''}`}
        />
      ))}
      <button
        className="slider-prev"
        onClick={() =>
          setSlideIndex((slideIndex + aulaActiva.fotos.length - 1) % aulaActiva.fotos.length)
        }
      >‹</button>
      <button
        className="slider-next"
        onClick={() =>
          setSlideIndex((slideIndex + 1) % aulaActiva.fotos.length)
        }
      >›</button>
    </div>
  </div>
)}

    </div>
  );
}

export default App;
