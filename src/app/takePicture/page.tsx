"use client"
import { useEffect, useState } from "react";

export default function Prevention() {
  const [station, setStation] = useState<{ name: string; latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const storedStation = sessionStorage.getItem("station");
    if (storedStation) {
      setStation(JSON.parse(storedStation));
    }
  }, []);

  if (!station) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Registrando Prevenções para {station.name}</h1>
      <p>🌍 Latitude: {station.latitude}</p>
      <p>🌍 Longitude: {station.longitude}</p>
    </div>
  );
}
