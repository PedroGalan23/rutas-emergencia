// src/constants/AppConstants.js
// Archivo centralizado que contiene constantes globales y recursos estáticos utilizados a lo largo de toda la aplicación.

import salidaLeyenda from "../assets/salidaLeyenda.png";         // Icono gráfico para la leyenda (salidas)
import escaleras2 from "../assets/escaleras2.png";               // Icono gráfico para la leyenda (escaleras)
import salidasEmergencia from "../data/salidasEmergencia.json";  // Datos JSON con posiciones de salidas de emergencia
import planoBaja from "../assets/PG1-PlantaBaja.jpg";            // Imagen JPG de la planta baja del edificio
import planoIntermedia from "../assets/PG2-Planta Intermedia.jpg"; // Imagen JPG de la planta intermedia
import planoPrimera from "../assets/PG3-Planta Primera.jpg";     // Imagen JPG de la planta primera
import planoSegunda from "../assets/PG4-Planta Segunda.jpg";     // Imagen JPG de la planta segunda
import planoPalomar from "../assets/Palomar.png";                // Imagen PNG del Palomar
import zonasComunesData from "../data/zonasComunes.json";        // Datos JSON de zonas comunes
import escaleraData from "../data/escaleras.json";               // Datos JSON con información y posiciones de escaleras
import monje1 from "../assets/monje1.png";                       // Fotograma inicial del monje (para animación)
import monje2 from "../assets/monje2.png";                       // Fotograma alternativo del monje (para animación)
import salidaAmarillo from "../assets/salidaAmarillo.png";       // Imagen salida color amarillo
import salidaVerde from "../assets/salidaVerde.png";             // Imagen salida color verde
import salidaAzul from "../assets/salidaAzul.png";               // Imagen salida color azul

// Dimensiones totales de las imágenes de planos del edificio (usado para fijar límites del mapa Leaflet)
export const imageWidth = 7017;
export const imageHeight = 4963;
export const imageBounds = [
  [0, 0],
  [imageHeight, imageWidth],
];

// Imágenes de salidas categorizadas por colores específicos
export const imagesSalida = {
  "src/assets/salidaAmarillo.png": salidaAmarillo,
  "src/assets/salidaVerde.png": salidaVerde,
  "src/assets/salidaAzul.png": salidaAzul,
};

// Array con las imágenes para la animación del personaje del monje
export const monjeFrames = [monje1, monje2];

// Etiquetas breves para representar cada planta en la interfaz
export const plantLabels = {
  "Planta Baja": "PB",
  "Planta Intermedia": "PE",
  "Planta Palomar": "PL",
  "Planta Primera": "P1",
  "Planta Segunda": "P2",
};

// Mapeo directo entre nombres de plantas y rutas de imágenes correspondientes
export const planos = {
  "Planta Baja": planoBaja,
  "Planta Intermedia": planoIntermedia,
  "Planta Palomar": planoPalomar,
  "Planta Primera": planoPrimera,
  "Planta Segunda": planoSegunda,
};

// Diccionario de etiquetas descriptivas asociadas a imágenes específicas usadas en carruseles
export const fotosLabels = {
  "camara-fotografica.png": "Cámara Fotográfica",
  "escalera_pistas.jpg": "Escalera Pistas",
  "escalera_principal.jpg": "Escalera Principal",
  "escalera_secretaria1.jpg": "Escalera Secretaría 1",
  "escalera_secretaria2.jpg": "Escalera Secretaría 2",
  "escalera_superior_pistas.jpg": "Escalera Superior Pistas",
  "escalera_superior_principal.jpg": "Escalera Superior Principal",
  "escalera_superior_villanueva.jpg": "Escalera Superior Villanueva",
  "escalera1.jpg": "Escalera 1",
  "puerta_conserjeria.jpg": "Puerta Conserjería",
  "puerta_miguel_hernandez.jpg": "Puerta Miguel Hernández",
};

// Exportación de recursos gráficos adicionales utilizados en la interfaz (leyenda)
export {
  salidaLeyenda,
  escaleras2,
  salidasEmergencia,
  zonasComunesData,
};

// Exportación de datos de escaleras obtenidos de JSON externo
export const escaleras = escaleraData;

// Breakpoint que determina si el dispositivo se considera móvil (usado para diseño responsive)
export const MOBILE_BREAKPOINT = 480;

// Carga dinámica de imágenes desde el directorio 'assets/fotos' para el carrusel fotográfico
const fotosContext = require.context("../assets/fotos", false, /\.(png|jpe?g|svg)$/);
export const fotosMap = fotosContext.keys().reduce((map, key) => {
  const filename = key.replace("./", "");
  map[filename] = fotosContext(key);
  return map;
}, {});
