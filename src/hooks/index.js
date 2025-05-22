// src/hooks/index.js
// Punto de entrada (barrel) para todos los hooks personalizados de la aplicación.
// Esto permite importarlos de forma centralizada: `import { useIsMobile, useAulasData } from 'src/hooks'`.

export * from './useIsMobile';        // Hook para detectar si la vista actual corresponde a un dispositivo móvil
export * from './useAulasData';       // Hook para cargar y gestionar los datos de aulas según la planta seleccionada
export * from './useUrlParams';       // Hook para leer y escribir parámetros de consulta (query params) en la URL
export * from './useMonjeAnimation';  // Hook para gestionar la animación del icono del monje en el mapa
export * from './useRouteAnimation';  // Hook para controlar la animación de la ruta de evacuación en el mapa
