require("dotenv").config();
const express = require("express");
const path = require("path");
const cron = require("node-cron");
const syncAulas = require("./syncAulas");

const app = express();

app.use(express.static(path.join(__dirname, "build")));

app.use("/data", express.static(path.join(__dirname, "public", "data")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Cron diario a las 03:00 (Europe/Madrid)
cron.schedule(
  "0 3 * * *",
  () => {
    console.log("🔄 Ejecutando syncAulas()");
    syncAulas();
  },
  {
    timezone: "Europe/Madrid",
  }
);

// 5) Arranca servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
