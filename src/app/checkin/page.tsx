"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const handleSelectStation = async (station: Station) => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada pelo navegador");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        station.latitude,
        station.longitude
      );

      if (distance > 500) {
        alert(`Distância do posto: ${distance.toFixed(1)} metros. Aproxime-se!`);
        return;
      }

      setSelectedStation(station);
      setTimeout(() => fileInputRef.current?.click(), 100); // Delay para garantir renderização
      
    } catch (err) {
      setError("Erro ao obter localização: " + (err instanceof Error ? err.message : ''));
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedStation || !event.target.files?.[0]) return;

    const file = event.target.files[0];
    setError(null);
    setSuccessMessage(null);

    try {
      // Gerar nome do arquivo
      const fileName = `${selectedStation.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${file.type.split('/')[1]}`;

      // Fazer upload
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      // Obter URL e salvar no banco
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('photos').insert({
        station_name: selectedStation.name,
        photo_url: urlData.publicUrl,
        timestamp: new Date().toISOString()
      });

      if (dbError) throw dbError;

      // Feedback visual
      setSuccessMessage('Foto registrada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (err) {
      console.error(err);
      setError('Falha ao enviar foto. Tente novamente.');
    } finally {
      // Resetar estados sem fechar a página
      setSelectedStation(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Selecione um posto</h1>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>}

      <ul className="space-y-2">
        {stations.map((station, index) => (
          <li key={index}>
            <button
              onClick={() => handleSelectStation(station)}
              className="w-full text-left p-2 hover:bg-blue-50 rounded"
            >
              {station.name}
            </button>
          </li>
        ))}
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