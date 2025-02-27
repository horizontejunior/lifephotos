"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function MobileFeatures() {
  const [location, setLocation] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [postos, setPostos] = useState<{ nome: string; latitude: string; longitude: string }[]>([]);

  useEffect(() => {
    fetch("/api/postos")
      .then((res) => res.json())
      .then((data) => setPostos(data))
      .catch(() => setError("Erro ao carregar postos"));
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
      <button onClick={requestLocation} className="px-4 py-2 bg-blue-500 text-white rounded">
        Obter Localização
      </button>
      {location && <p>{location}</p>}

      <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" id="cameraInput" />
      <label htmlFor="cameraInput" className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer">
        Abrir Câmera
      </label>

      {image && <Image src={image} alt="Captura da câmera" width={256} height={256} className="mt-4" />}

      {/* Lista de postos cadastrados */}
      <h2 className="text-lg font-semibold mt-6">Postos Cadastrados</h2>
      {postos.length > 0 ? (
        <ul className="w-full max-w-md bg-gray-100 rounded p-4">
          {postos.map((posto, index) => (
            <li key={index} className="border-b py-2">
              <strong>{posto.nome}</strong> <br />
              <span className="text-sm text-gray-600">{posto.latitude}</span>
              <span className="text-sm text-gray-600">{posto.longitude}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Nenhum posto encontrado.</p>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
