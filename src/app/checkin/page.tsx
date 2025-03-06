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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const { data, error } = await supabase
          .from("station")
          .select("name, latitude, longitude");
        
        if (error) throw error;
        setStations(data || []);
      } catch (err) {
        console.error("Erro ao carregar postos:", err);
        setError("Falha ao carregar postos. Tente recarregar a página.");
      }
    };
    fetchStations();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2 - lat1) * Math.PI/180;
    const Δλ = (lon2 - lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleSelectStation = async (station: Station) => {
    setError(null);
    setSuccessMessage(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          err => reject(err.message),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });

      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        station.latitude,
        station.longitude
      );

      if (distance > 800) {
        alert(`Você está a ${distance.toFixed(1)} metros do posto.`);
        return;
      }
      
      setSelectedStation(station);
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, 100);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido na geolocalização");
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedStation || !event.target.files?.[0]) return;

    setIsProcessing(true);
    const file = event.target.files[0];
    
    try {
      // Sanitização do nome do arquivo
      const cleanStationName = selectedStation.name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      
      const fileName = `${cleanStationName}_${Date.now()}.${file.type.split('/')[1] || 'jpg'}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: 'public',
        });

      if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      // Registrar no banco de dados
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{
          station_name: selectedStation.name,
          photo_url: urlData.publicUrl,
          timestamp: new Date().toISOString()
        }]);

      if (dbError) throw new Error(`Erro no banco de dados: ${dbError.message}`);

      setSuccessMessage('Foto registrada com sucesso!');
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      // Delay para garantir que o iOS processe o upload
      setTimeout(() => {
        setIsProcessing(false);
        setSelectedStation(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1000);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Postos de Guarda-Vidas</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          ⚠️ {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          ✅ {successMessage}
        </div>
      )}

      <ul className="space-y-3">
        {stations.map((station, index) => (
          <li key={index}>
            <button
              onClick={() => handleSelectStation(station)}
              className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              disabled={isProcessing}
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
        disabled={isProcessing}
      />

      {isProcessing && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
          ⏳ Processando foto...
        </div>
      )}
    </div>
  );
}