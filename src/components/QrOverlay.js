// src/components/QrOverlay.js

import React, { useEffect, useState } from "react";
import { Marker } from "react-leaflet";
import { divIcon } from "leaflet";
import QRCode from "qrcode";

export const QrOverlay = React.memo(function QrOverlay({ aulaActiva, plantaSeleccionada }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  // URL del QR (aunque no haya aulaActiva, para mantener el orden de hooks)
  const url = aulaActiva
    ? `${window.location.origin}?planta=${encodeURIComponent(plantaSeleccionada)}&id=${encodeURIComponent(aulaActiva.id)}`
    : "";

  // Hook siempre se ejecuta, pero solo genera QR si hay aula
  useEffect(() => {
    if (!aulaActiva) return;
    QRCode.toDataURL(url, { width: 100, margin: 1 }, (err, url) => {
      if (err) {
        console.error("Error generando QR:", err);
        return;
      }
      setQrDataUrl(url);
    });
  }, [aulaActiva, url]);

  if (!aulaActiva || !qrDataUrl) return null;

  // Coordenadas donde debe aparecer el QR (dentro del plano)
  const qrCoords = { supIzq: [600, 4014], infDer: [175, 5851] };
  const center = [
    (qrCoords.supIzq[0] + qrCoords.infDer[0]) / 2,
    (qrCoords.supIzq[1] + qrCoords.infDer[1]) / 2,
  ];

  // HTML que se insertará como contenido del marcador Leaflet
  const html = `
    <div style="
      width: 200px;
      background-color: white;
      border: 2px solid black;
      border-radius: 6px;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      padding: 8px;
      font-family: sans-serif;
      font-size: 12px;
      line-height: 1.2;
      display: flex;
      flex-direction: row;
      align-items: center;
    ">
      <img src="${qrDataUrl}" width="70" height="70" style="margin-right: 8px;" />
      <div>
        <strong>${aulaActiva.grupo || aulaActiva.nombre}</strong><br/>
        ID: ${aulaActiva.id}<br/>
        ${aulaActiva.coordinadora ? '<strong style="color: red;">Aula Coordinadora</strong><br/>' : ''}
        <div style="display: flex; align-items: center; margin-top: 4px;">
          <div class="qr-circle"></div>
          Usted está aquí
        </div>
      </div>
    </div>
  `;

  return (
    <Marker
      position={center}
      icon={divIcon({
        html,
        className: "",
        iconAnchor: [100, 40], // centra el recuadro respecto al marcador
      })}
    />
  );
});
