// server.js
// Servidor Express que sirve la aplicación React, los datos estáticos y programa la sincronización diaria de aulas.

require("dotenv").config();                   // Carga variables de entorno desde .env
const express = require("express");           // Framework web
const path = require("path");                 // Utilidad para rutas de fichero
const cron = require("node-cron");            // Programación de tareas periódicas
const syncAulas = require("./syncAulas");     // Función que sincroniza aulas localmente

const app = express();

// 1) Servir los archivos estáticos del build de React
app.use(express.static(path.join(__dirname, "build")));

// 2) Servir el directorio public/data bajo la ruta /data,
//    con revalidación obligatoria solo en los .json
app.use(
  "/data",
  express.static(path.join(__dirname, "public", "data"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".json")) {
        // El navegador siempre revalida este recurso
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
      // El resto de assets (png, jpg, js, css…) siguen con la caché por defecto
    },
  })
);

// 3) En cualquier otra ruta, devolver index.html para habilitar el router de React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// 4) Programar tarea diaria a las 03:00 (hora de Europa/Madrid) para sincronizar aulas
cron.schedule(
  "0 3 * * *",                 // Minuto 0, hora 3, cada día
  () => {
    console.log("🔄 Ejecutando syncAulas()");
    syncAulas();
  },
  {
    timezone: "Europe/Madrid", // Zona horaria para la ejecución
  }
);

// 5) Iniciar el servidor en el puerto definido en .env o 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
