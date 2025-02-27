"use client"
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

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

  useEffect(() => {
    async function fetchStations() {
      const { data, error } = await supabase
        .from("station")
        .select("name, latitude, longitude");

      if (error) {
        console.error("Erro ao buscar postos:", error);
        setStations([]); // Garante que o estado não fique indefinido
      } else if (data) {
        setStations(data);
      }
    }

    fetchStations();
  }, []);

  const handleSelectStation = (station: Station) => {
    sessionStorage.setItem("station", JSON.stringify(station));
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Escolha um posto de guarda-vidas</h1>
      <ul className="space-y-2">
        {stations.length > 0 ? (
          stations.map((station, index) => (
            <li key={index}>
              <Link
                href="/takePicture"
                onClick={() => handleSelectStation(station) }
                className="text-blue-500 hover:underline"
              >
                {station.name}
              </Link>
            </li>
          ))
        ) : (
          <p className="text-gray-500">Nenhum posto encontrado.</p>
        )}
      </ul>
    </div>
  );
}
