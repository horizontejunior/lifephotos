import { supabase } from "@/lib/supabase";

interface Station {
  name: string;
  latitude: number;
  longitude: number;
}

export const getStations = async (input?: {
  search?: string;
}): Promise<Station[]> => {
  let query = supabase.from("station").select("name, latitude, longitude");

  if (input?.search) {
    query = query.ilike("name", `%${input.search}%`);
  }

  const { data: stations } = await query;

  return stations || [];

  // const response = await fetch(`http://localhost:3000/api/stations?q=${input?.search || ""}`);
  // const data = await response.json();
  // return data;
};
