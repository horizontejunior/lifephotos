import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  console.log(searchParams);
  const search = searchParams.get("q") || "";

  try {
    let query = supabase.from("station").select("name, latitude, longitude");

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data: stations } = await query;

    return NextResponse.json(stations);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ status: 500 });
  }
}
