"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

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
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!navigator.geolocation) {
      setError("Seu dispositivo não suporta geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, station.latitude, station.longitude);

        if (distance <= 50) {
          setSelectedStation(station);
          fileInputRef.current?.click(); // Abre a câmera do celular
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedStation) return;

    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = `photo-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("photos") // Nome do bucket no Supabase
      .upload(fileName, file, {
        contentType: "image/jpeg",
      });

    if (error) {
      console.error("Erro ao salvar imagem:", error.message);
      return;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`;
    
    const { error: dbError } = await supabase.from("photo_logs").insert([
      {
        station_name: selectedStation.name,
        timestamp: new Date().toISOString(),
        photo_url: imageUrl,
      },
      console.log("chegou aqui")
    ]);

    if (dbError) {
      console.error("Erro ao salvar no banco:", dbError.message);
    } else {
      alert("Foto salva com sucesso!");
      setSelectedStation(null);
    }
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

      {/* Input invisível para abrir a câmera */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
