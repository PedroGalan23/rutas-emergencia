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
import planoImg from './assets/PG1-PlantaBaja.jpg'; // Imagen rotada correctamente

function App() {
  // 📐 Dimensiones del plano
  const imageWidth = 7017;
  const imageHeight = 4963;
  const imageBounds = [[0, 0], [imageHeight, imageWidth]];

  // 🟨 Aula: Sala de Juegos
  const salaJuegosBounds = [
    [767, 4220],   // esquina inferior izquierda
    [1015, 4748]   // esquina superior derecha
  ];

  // ✅ Coordenadas estilizadas y rectificadas (sentido SALIDA → aula)
  const rutaEvacuacion = [
    [727, 2488],     // salida exterior
    [911, 2488],
    [1183, 2488],
    [1175, 2720],
    [1175, 3032],
    [1175, 3280],
    [1175, 3568],
    [1175, 3768],
    [1175, 4032],
    [1175, 4304],
    [1031, 4312]     // llegada al aula
  ];

  // ▶️ Icono de flecha (reversa)
  const arrowIcon = divIcon({
    html: '⬅️', // apunta hacia la izquierda, puedes usar ↖️ ↩️ ➡️ etc.
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: ''
  });

  // 🎯 Controla si se ha hecho clic en el aula
  const [mostrarRuta, setMostrarRuta] = useState(false);

  // 🔍 Clics en el mapa
  function ClickHandler() {
    useMapEvent('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log(`📍 Coordenadas clic: [${Math.round(lat)}, ${Math.round(lng)}]`);

      // Comprueba si el clic está dentro del aula
      const dentroDeAula =
        lat >= salaJuegosBounds[0][0] &&
        lat <= salaJuegosBounds[1][0] &&
        lng >= salaJuegosBounds[0][1] &&
        lng <= salaJuegosBounds[1][1];

      setMostrarRuta(dentroDeAula);
    });
    return null;
  }

  return (
    <div className="App">
      {/* Cabecera */}
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

      {/* Mapa */}
      <MapContainer
        crs={CRS.Simple}
        bounds={imageBounds}
        minZoom={-3}
        maxZoom={1}
        style={{ width: '100%', height: '90vh' }}
        whenCreated={(map) => map.fitBounds(imageBounds)}
      >
        {/* Imagen del plano */}
        <ImageOverlay url={planoImg} bounds={imageBounds} />

        {/* Aula: solo resaltada si se ha clicado */}
        {mostrarRuta && (
          <Rectangle
            bounds={salaJuegosBounds}
            pathOptions={{
              color: 'orange',
              fillColor: 'orange',
              fillOpacity: 0.5,
              weight: 4
            }}
          />
        )}

        {/* Ruta y flechas si está activado */}
        {mostrarRuta && (
          <>
            <Polyline
              positions={rutaEvacuacion}
              pathOptions={{ color: 'orange', weight: 4 }}
            />
            {rutaEvacuacion.map((p, i) => (
              <Marker key={i} position={p} icon={arrowIcon} />
            ))}
          </>
        )}

        <ClickHandler />
      </MapContainer>
    </div>
  );
}

export default App;
