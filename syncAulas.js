// syncAulas.js
// Script para sincronizar datos de aulas locales con un JSON remoto mediante Node.js

require("dotenv").config();              // Carga variables de entorno desde .env
const axios = require("axios");          // Cliente HTTP para realizar peticiones remotas
const fs = require("fs-extra");          // Módulo para leer/escribir JSON y operaciones en sistema de ficheros
const path = require("path");            // Utilidad para gestionar rutas de ficheros de forma segura

/**
 * Función principal que realiza la sincronización.
 * - Descarga el JSON remoto.
 * - Lee el JSON local.
 * - Compara cada registro y actualiza los campos que hayan cambiado.
 * - Escribe de forma atómica el JSON local actualizado.
 */
async function syncAulas() {
  try {
    // 1. Descarga el JSON remoto usando la URL definida en la variable de entorno REMOTE_JSON_URL
    const { data: remoteData } = await axios.get(process.env.REMOTE_JSON_URL);

    // 2. Lee el JSON local desde public/data/aulas.json
    const localPath = path.join(__dirname, "public", "data", "aulas.json");
    const localJson = await fs.readJson(localPath);

    // 3. Recorre cada aula del JSON remoto para buscar y actualizar el objeto correspondiente en localJson
    let cambios = [];  // Array para registrar los IDs de aulas que han sido modificadas

    remoteData.forEach((item) => {
      const { aula: remoteId, descripcion, grupo } = item;

      for (const planta in localJson) {
        const arr = localJson[planta];
        const localObj = arr.find((o) => o.id === remoteId);
        if (!localObj) continue;

        let actualizado = false;

        // Sincroniza el campo 'nombre' con 'descripcion' del remoto
        if (localObj.nombre !== descripcion) {
          localObj.nombre = descripcion;
          actualizado = true;
        }

        // Sincroniza el campo 'grupo'
        if (localObj.grupo !== grupo) {
          localObj.grupo = grupo;
          actualizado = true;
        }

        if (actualizado) cambios.push(remoteId);
        break;
      }
    });


    // 4. Si no hubo cambios, informa y finaliza
    if (cambios.length === 0) {
      console.log("✔ No se detectaron cambios en aulas existentes");
      return;
    }

    // 5. Escritura atómica: escribe en un fichero temporal y luego reemplaza el original
    const tmpPath = localPath + ".tmp";
    await fs.writeJson(tmpPath, localJson, { spaces: 2 });
    await fs.move(tmpPath, localPath, { overwrite: true });

    // 6. Mensaje finalización con lista única de IDs actualizados
    const uniques = [...new Set(cambios)];
    console.log(`✔ Aulas actualizadas: ${uniques.join(", ")}`);
  } catch (err) {
    // Manejo de errores generales: muestra en consola
    console.error("✖ Error al sincronizar aulas:", err);
  }
}

// Exporta la función para poder invocarla desde otros scripts o tests
module.exports = syncAulas;

// Si el script se ejecuta directamente con `node syncAulas.js`, lanza la sincronización
if (require.main === module) {
  syncAulas();
}
