require('dotenv').config();

const axios = require('axios');
const fs    = require('fs-extra');
const path  = require('path');

async function syncAulas() {
  try {
    // 1. Descarga remoto
    const { data: remoteData } = await axios.get(process.env.REMOTE_JSON_URL);

    // 2. Lee local
    const localPath = path.join(__dirname, 'public', 'data', 'aulas.json');
    const localJson = await fs.readJson(localPath);

    // 3. Índice de IDs locales
    const localSet = new Set();
    Object.values(localJson).forEach(arr =>
      arr.forEach(a => localSet.add(a.id))
    );

    // 4. Filtra aulas nuevas
    const nuevas = remoteData.filter(item => !localSet.has(item.aula));
    if (nuevas.length === 0) {
      console.log('✔ No hay aulas nuevas');
      return;
    }

    // 5. Mapa de plantas
    const plantaMap = {
      B: 'Planta Baja',
      E: 'Planta Intermedia',
      P: 'Planta Primera',
      S: 'Planta Segunda'
    };

    // Agrega cada nueva aula
    nuevas.forEach(item => {
      const letra  = item.aula[0].toUpperCase();
      const planta = plantaMap[letra] || 'Planta Baja';

      const nuevaAula = {
        id:           item.aula,
        nombre:       item.descripcion,
        sector:       'red',
        color:        'red',
        grupo:        'red',
        coordinadora: false,
        coordenadas:  { supIzq: [], infDer: [] },
        ruta:         []
      };

      localJson[planta].push(nuevaAula);
    });

    // 6. Escritura atómica
    const tmpPath = localPath + '.tmp';
    await fs.writeJson(tmpPath, localJson, { spaces: 2 });
    await fs.move(tmpPath, localPath, { overwrite: true });

    console.log(`✔ Sincronizadas aulas: ${nuevas.map(i => i.aula).join(', ')}`);
  }
  catch (err) {
    console.error('✖ Error al sincronizar aulas:', err);
  }
}

module.exports = syncAulas;
