import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { station, morning_prev, afternoon_prev, morning_jellyfish, afternoon_jellyfish } = await req.json();

    if (!station || !station.name || !station.latitude || !station.longitude) {
      return NextResponse.json({ error: "Dados do posto estão incompletos!" }, { status: 400 });
    }

    const { data, error } = await supabase.from("prevention").insert([
      {
        station_name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
        morning_prev,
        afternoon_prev,
        morning_jellyfish,
        afternoon_jellyfish,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Dados inseridos com sucesso!", data }, { status: 201 });

  } catch {
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
