"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function MobileFeatures() {
  const [location, setLocation] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);
  const [cameraPermission, setCameraPermission] = useState<PermissionState | null>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
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

      {/* Input para abrir a câmera do celular */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="cameraInput"
      />
      <label
        htmlFor="cameraInput"
        className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
      >
        Abrir Câmera
      </label>

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
