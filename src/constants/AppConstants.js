// src/constants/AppConstants.js
// Archivo de constantes globales para la aplicación (datos estáticos, configuraciones y rutas de recursos)

import salidaLeyenda from "../assets/salidaLeyenda.png";
import escaleras2 from "../assets/escaleras2.png";
import salidasEmergencia from "../data/salidasEmergencia.json";
import planoBaja from "../assets/PG1-PlantaBaja.jpg";
import planoIntermedia from "../assets/PG2-Planta Intermedia.jpg";
import planoPrimera from "../assets/PG3-Planta Primera.jpg";
import planoSegunda from "../assets/PG4-Planta Segunda.jpg";
import planoPalomar from "../assets/Palomar.png";
import zonasComunesData from "../data/zonasComunes.json";
import escaleraData from "../data/escaleras.json";
import monje1 from "../assets/monje1.png";
import monje2 from "../assets/monje2.png";
import salidaAmarillo from "../assets/salidaAmarillo.png";
import salidaVerde from "../assets/salidaVerde.png";
import salidaAzul from "../assets/salidaAzul.png";

// Dimensiones y límites de la imagen del plano
export const imageWidth = 7017;
export const imageHeight = 4963;
export const imageBounds = [
  [0, 0],
  [imageHeight, imageWidth],
];

// Imágenes de salidas por color
export const imagesSalida = {
  "src/assets/salidaAmarillo.png": salidaAmarillo,
  "src/assets/salidaVerde.png": salidaVerde,
  "src/assets/salidaAzul.png": salidaAzul,
};

// Array de fotogramas del monje para animación
export const monjeFrames = [monje1, monje2];

// Etiquetas cortas para cada planta
export const plantLabels = {
  "Planta Baja": "PB",
  "Planta Intermedia": "PE",
  "Planta Palomar": "PL",
  "Planta Primera": "P1",
  "Planta Segunda": "P2",
};

// Mapas por planta
export const planos = {
  "Planta Baja": planoBaja,
  "Planta Intermedia": planoIntermedia,
  "Planta Palomar": planoPalomar,
  "Planta Primera": planoPrimera,
  "Planta Segunda": planoSegunda,
};


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
  "puerta_miguel_hernandez.jpg": "Puerta Miguel Hernández"
};

// Exportar todo lo necesario
export {
  salidaLeyenda,
  escaleras2,
  salidasEmergencia,
  zonasComunesData,
};

// Escaleras desde JSON
export const escaleras = escaleraData;

// Valor de corte para detectar móviles
export const MOBILE_BREAKPOINT = 480;

// Mapeo dinámico de imágenes para el carrusel
const fotosContext = require.context("../assets/fotos", false, /\.(png|jpe?g|svg)$/);
export const fotosMap = fotosContext.keys().reduce((map, key) => {
  const filename = key.replace("./", "");
  map[filename] = fotosContext(key);
  return map;
}, {});
