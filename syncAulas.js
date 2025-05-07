require("dotenv").config();
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function syncAulas() {
  try {
    // Descarga el JSON remoto
    const { data: remoteData } = await axios.get(process.env.REMOTE_JSON_URL);

    // Lee el JSON local
    const localPath = path.join(__dirname, "public", "data", "aulas.json");
    const localJson = await fs.readJson(localPath);

    // Para cada aula remota, busca y actualiza en el local
    let cambios = [];
    remoteData.forEach((item) => {
      const { aula: remoteId, descripcion, nivel, grupo } = item;

      // Recorre cada planta para buscar la coincidencia por id
      for (const planta in localJson) {
        const arr = localJson[planta];
        const localObj = arr.find((o) => o.id === remoteId);
        if (!localObj) continue;

        // Comprueba y actualiza si hay diferencias
        let actualizado = false;

        // descripcion → nombre
        if (localObj.nombre !== descripcion) {
          localObj.nombre = descripcion;
          actualizado = true;
        }

        // nivel → sector
        if (localObj.sector !== nivel) {
          localObj.sector = nivel;
          actualizado = true;
        }

        // grupo → grupo
        if (localObj.grupo !== grupo) {
          localObj.grupo = grupo;
          actualizado = true;
        }

        if (actualizado) {
          cambios.push(remoteId);
        }

        break;
      }
    });

    if (cambios.length === 0) {
      console.log("✔ No se detectaron cambios en aulas existentes");
      return;
    }

    // Escritura atómica del JSON actualizado
    const tmpPath = localPath + ".tmp";
    await fs.writeJson(tmpPath, localJson, { spaces: 2 });
    await fs.move(tmpPath, localPath, { overwrite: true });

    console.log(`✔ Aulas actualizadas: ${[...new Set(cambios)].join(", ")}`);
  } catch (err) {
    console.error("✖ Error al sincronizar aulas:", err);
  }
}

module.exports = syncAulas;

if (require.main === module) {
  syncAulas();
}
