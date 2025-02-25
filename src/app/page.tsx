"use client";

import { useState } from "react";

export default function MobileFeatures() {
  const [location, setLocation] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Solicita permissão e obtém a localização
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Seu dispositivo não suporta geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`Latitude: ${latitude}, Longitude: ${longitude}`);
        setError(null);
      },
      (err) => {
        setError("Você precisa permitir o acesso à localização para usar este recurso.");
      },
      { enableHighAccuracy: true }
    );
  };

  // Função para solicitar acesso à câmera e capturar uma imagem
  const requestCamera = async () => {
    try {
      // Solicita permissão e acessa a câmera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play(); // Aguarda o vídeo carregar

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      setImage(canvas.toDataURL("image/png"));

      stream.getTracks().forEach((track) => track.stop()); // Fecha a câmera
      setError(null);
    } catch (err) {
      setError("Você precisa permitir o acesso à câmera para usar este recurso.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <button
        onClick={requestLocation}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Obter Localização
      </button>
      {location && <p>{location}</p>}

      <button
        onClick={requestCamera}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Abrir Câmera
      </button>
      {image && <img src={image} alt="Captura da câmera" className="mt-4 w-64" />}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
