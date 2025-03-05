"use client";

import Link from "next/link";
import { Input } from "./input";
import { useCallback, useEffect, useState } from "react";

interface Station {
  name: string;
  latitude: number;
  longitude: number;
}

type Props = {
  stations: Station[];
};

const getCurrentPosition = async () => {
  // client
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  return position;
};

const useGetCurrentPosition = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPosition = useCallback(async () => {
    try {
      setIsLoading(true);
      const newPosition = await getCurrentPosition();
      setPosition(newPosition);
    } catch (error) {
      console.error(error);
      setError(JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getPosition();
  }, [getPosition]);

  return { position, getPosition, isLoading, error };
};

export const Stations = ({ stations }: Props) => {
  const [filteredStations, setFilteredStations] = useState<Station[]>(stations);

  const { position, getPosition, error, isLoading } = useGetCurrentPosition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilteredStations(
      stations.filter((station) =>
        station.name.toLocaleLowerCase().includes(value.toLocaleLowerCase())
      )
    );
  };

  return (
    <>
      <div className="flex items-center justify-center p-4 space-x-2">
        <Input
          type="text"
          placeholder="Buscar posto"
          autoFocus
          onChange={handleSearch}
        />
      </div>

      {filteredStations.length === 0 && (
        <div className="flex items-center justify-center p-4">
          <p className="text-gray-500">Nenhum posto encontrado!</p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center p-4 space-x-2">
        <div>
          {isLoading
            ? `atualizando...`
            : `Latitude: ${position?.coords.latitude} Longitude ${position?.coords.longitude}`}
        </div>
        <button
          className=" p-2 text-center border-primary bg-yellow-50 border-2 rounded-lg text-bold "
          onClick={getPosition}
        >
          Atualizar localização
        </button>
      </div>

      <div className="w-full flex p-4 justify-center ">
        <ul className="grid grid-cols-3 sm:grid-cols-9 gap-4 ">
          {filteredStations.map((station, index) => (
            <li key={index}>
              <Link
                href={`/station/${station.name}?lat=${position?.coords.latitude}&long=${position?.coords.longitude}`}
              >
                <button className="h-32 w-full p-2 text-center border-primary bg-yellow-50 border-2 rounded-lg text-bold ">
                  {station.name}
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>{error && <p className="text-red-500">{error}</p>}</div>
    </>
  );
};
