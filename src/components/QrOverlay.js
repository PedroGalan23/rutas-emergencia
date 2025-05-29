// src/components/QrOverlay.js
// Componente que genera y muestra un marcador con código QR sobre el mapa indicando el aula activa y su información contextual

import React, { useEffect, useState } from "react";
import { Marker } from "react-leaflet"; // Componente de Leaflet para colocar un marcador
import { divIcon } from "leaflet"; // Utilidad para crear iconos personalizados en HTML
import QRCode from "qrcode"; // Librería externa para generar códigos QR

export const QrOverlay = React.memo(function QrOverlay({ aulaActiva }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  // URL del QR solo con el parámetro id
  const url = aulaActiva
    ? `${window.location.origin}?id=${encodeURIComponent(aulaActiva.id)}`
    : "";

  useEffect(() => {
    if (!aulaActiva) return;

    QRCode.toDataURL(url, { width: 100, margin: 1 }, (err, url) => {
      if (err) {
        console.error("Error generando QR:", err);
        return;
      }
      setQrDataUrl(url); // Se guarda la imagen del QR como Data URL
    });
  }, [aulaActiva, url]);

  // Si no hay aula activa o aún no se ha generado el QR, no se muestra nada
  if (!aulaActiva || !qrDataUrl) return null;

  // Coordenadas fijas en el plano donde debe colocarse el QR
  const qrCoords = { supIzq: [600, 4014], infDer: [175, 5851] };
  const center = [
    (qrCoords.supIzq[0] + qrCoords.infDer[0]) / 2,
    (qrCoords.supIzq[1] + qrCoords.infDer[1]) / 2,
  ];

  // HTML personalizado que se mostrará dentro del marcador
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

  // Renderizar el marcador en el mapa
  return (
    <Marker
      position={center}
      icon={divIcon({
        html,
        className: "",
        iconAnchor: [100, 40],
      })}
    />
  );
});
