"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function MobileFeatures() {
  const [location, setLocation] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);
  const [cameraPermission, setCameraPermission] = useState<PermissionState | null>(null);

  // Verifica o status das permissões ao carregar o componente
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationPermission(result.state);
        result.onchange = () => setLocationPermission(result.state);
      });

      navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
        setCameraPermission(result.state);
        result.onchange = () => setCameraPermission(result.state);
      });
    }
  }, []);

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
      () => {
        setError("Permissão de localização negada. Verifique as configurações do seu dispositivo.");
      },
      { enableHighAccuracy: true }
    );
  };

  // Função para solicitar acesso à câmera e capturar uma imagem
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      setImage(canvas.toDataURL("image/png"));

      stream.getTracks().forEach((track) => track.stop()); // Fecha a câmera
      setError(null);
    } catch (_err) {
      setError("Permissão da câmera negada. Verifique as configurações do seu dispositivo." + _err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <p className="text-gray-700">
        Permissão de Localização: {locationPermission || "Desconhecida"}
      </p>
      <button
        onClick={requestLocation}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Obter Localização
      </button>
      {location && <p>{location}</p>}

      <p className="text-gray-700">
        Permissão da Câmera: {cameraPermission || "Desconhecida"}
      </p>
      <button
        onClick={requestCamera}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Abrir Câmera
      </button>
      {image && (
        <Image
          src={image}
          alt="Captura da câmera"
          width={256}
          height={256}
          className="mt-4"
        />
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
