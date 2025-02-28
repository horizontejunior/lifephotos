"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Prevention() {
  const router = useRouter();
  const [station, setStation] = useState<{ name: string; latitude: number; longitude: number } | null>(null);

  const [morningPreventions, setMorningPreventions] = useState("");
  const [afternoonPreventions, setAfternoonPreventions] = useState("");
  const [morningJellyfish, setMorningJellyfish] = useState("");
  const [afternoonJellyfish, setAfternoonJellyfish] = useState("");

  useEffect(() => {
    const storedStation = sessionStorage.getItem("station");
    if (storedStation) {
      setStation(JSON.parse(storedStation));
    } else {
      router.push("/chooseStation");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!station) return;

    const response = await fetch("/api/prevention", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        station,
        morning_prev: morningPreventions,
        afternoon_prev: afternoonPreventions,
        morning_jellyfish: morningJellyfish,
        afternoon_jellyfish: afternoonJellyfish,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Erro ao inserir dados:", result.error);
    } else {
      console.log("Dados inseridos com sucesso:", result.data);
      router.push("/chooseStation");
    }
  };

  if (!station) return <p>Carregando...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registro de Prevenções - {station.name}</h1>
      <p>📍 Latitude: {station.latitude}</p>
      <p>📍 Longitude: {station.longitude}</p>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block font-medium">Prevenções pela manhã:</label>
          <input
            type="text"
            value={morningPreventions}
            onChange={(e) => setMorningPreventions(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Prevenções pela tarde:</label>
          <input
            type="text"
            value={afternoonPreventions}
            onChange={(e) => setAfternoonPreventions(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Lesões por água-viva pela manhã:</label>
          <input
            type="text"
            value={morningJellyfish}
            onChange={(e) => setMorningJellyfish(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Lesões por água-viva pela tarde:</label>
          <input
            type="text"
            value={afternoonJellyfish}
            onChange={(e) => setAfternoonJellyfish(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Salvar
        </button>
      </form>
    </div>
  );
}
