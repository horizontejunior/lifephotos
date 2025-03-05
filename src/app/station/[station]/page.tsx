import { CheckIn } from "@/components/check-in";
import { getStations } from "@/services/get-stations";

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default async function ChooseStation(props: {
  params: Promise<{ station: string }>;
  searchParams: Promise<{ lat: string; long: string }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const stationName = decodeURIComponent(params.station);

  const stations = await getStations({ search: stationName });
  const station = stations[0];

  const distance = calculateDistance(
    Number(searchParams.lat),
    Number(searchParams.long),
    station.latitude,
    station.longitude
  );

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{stationName}</h1>

      <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg">
        🚨 Você está a {distance?.toFixed(1)} metros do posto.
      </div>

      <CheckIn distance={distance} />
    </div>
  );
}
