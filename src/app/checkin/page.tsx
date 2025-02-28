"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Configuração do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Station {
  name: string;
  latitude: number;
  longitude: number;
}

export default function ChooseStation() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStations() {
      const { data, error } = await supabase
        .from("station")
        .select("name, latitude, longitude");

      if (error) {
        console.error("Erro ao buscar postos:", error);
        setStations([]); 
      } else if (data) {
        setStations(data);
      }
    }

    fetchStations();
  }, []);

  // Função para calcular a distância entre duas coordenadas (Fórmula de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Raio da Terra em metros
    const toRadians = (degree: number) => (degree * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Retorna a distância em metros
  };

  const handleSelectStation = (station: Station) => {
    sessionStorage.setItem("station", JSON.stringify(station));

    if (!navigator.geolocation) {
      setError("Seu dispositivo não suporta geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, station.latitude, station.longitude);

        if (distance <= 50) {
          router.push("/takePicture"); // Dentro do raio, permite tirar a foto
        } else {
          alert(`Você está a ${distance.toFixed(2)} metros do posto. Aproxime-se para tirar a foto.`);
        }
      },
      () => {
        setError("Permissão de localização negada. Verifique as configurações do seu dispositivo.");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Escolha um posto de guarda-vidas</h1>
      <ul className="space-y-2">
        {stations.length > 0 ? (
          stations.map((station, index) => (
            <li key={index}>
              <button
                onClick={() => handleSelectStation(station)}
                className="text-blue-500 hover:underline"
              >
                {station.name}
              </button>
            </li>
          ))
        ) : (
          <p className="text-gray-500">Nenhum posto encontrado.</p>
        )}
      </ul>
    </div>
  );
}
