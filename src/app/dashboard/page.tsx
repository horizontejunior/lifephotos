import { Stations } from "@/components/stations";
import { getStations } from "@/services/get-stations";


export default async function Dashboard() {
  const stations = await getStations();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-yellow-400 text-transparent bg-clip-text">
          Life App
        </h1>
        <p className="text-sm">Selecione um posto para continuar</p>
      </div>

      <Stations stations={stations} />
    </div>
  );
}
