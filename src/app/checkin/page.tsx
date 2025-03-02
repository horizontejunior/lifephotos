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
    const R = 6371e3;
    const toRadians = (degree: number) => (degree * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
          fileInputRef.current?.click();
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

    try {
      const sanitizedStationName = selectedStation.name
        .replace(/\s+/g, '_')
        .toLowerCase();

      const timestamp = new Date().getTime();
      const fileName = `${sanitizedStationName}_${timestamp}.jpg`;

      // Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      // Inserir metadados no banco
      const { error: dbError } = await supabase.from("photos").insert([{
        station_name: selectedStation.name,
        timestamp: new Date().toISOString(),
        photo_url: urlData.publicUrl
      }]);

      if (dbError) throw dbError;

      alert("Foto salva com sucesso!");
      setSelectedStation(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (error) {
      console.error("Erro no processo de upload:", error);
      alert("Erro ao salvar a foto. Tente novamente.");
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