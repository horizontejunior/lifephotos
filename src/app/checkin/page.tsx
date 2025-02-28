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
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    if (!navigator.geolocation) {
      setError("Seu dispositivo não suporta geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, station.latitude, station.longitude);

        if (distance <= 50) {
          setSelectedStation(station);
          setCameraEnabled(true);
          startCamera();
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

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        setError("Não foi possível acessar a câmera.");
      }
    } else {
      setError("Seu dispositivo não suporta a câmera.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        videoRef.current.srcObject = null; // Para a câmera após tirar a foto
        sendPhotoToDatabase();
      }
    }
  };

  const sendPhotoToDatabase = async () => {
    if (!selectedStation || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg"));
    
    if (!blob) {
      console.error("Erro ao converter imagem.");
      return;
    }

    const fileName = `photo-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("photos") // Nome do bucket no Supabase
      .upload(fileName, blob, {
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
    ]);

    if (dbError) {
      console.error("Erro ao salvar no banco:", dbError.message);
    } else {
      alert("Foto salva com sucesso!");
      setCameraEnabled(false);
      setSelectedStation(null);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Escolha um posto de guarda-vidas</h1>
      
      {!cameraEnabled ? (
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
      ) : (
        <div className="flex flex-col items-center">
          <video ref={videoRef} autoPlay className="w-full max-w-sm border rounded-md" />
          <canvas ref={canvasRef} className="hidden" width="640" height="480" />
          <button
            onClick={capturePhoto}
            className="bg-blue-500 text-white p-2 rounded mt-4"
          >
            Tirar Foto
          </button>
        </div>
      )}
    </div>
  );
}
