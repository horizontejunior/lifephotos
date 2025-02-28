import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const supabase = createClient("https://rbknzfcuanmdutsipexz.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia256ZmN1YW5tZHV0c2lwZXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MTYzMzUsImV4cCI6MjA1NjE5MjMzNX0.wdqTZFCIX49oy7065GBdNuAvIPfBlwo41prIeCpJGSk");
    const { email, password } = await req.json();

    // Verifica se o usuário existe
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, password")
      .eq("email", email)
      .single();

    if (!user || error) {
      return NextResponse.json({ error: "E-mail ou senha incorretos!" }, { status: 400 });
    }

    // Compara a senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "E-mail ou senha incorretos!" }, { status: 400 });
    }

    // Criar a sessão do usuário (simplificado, sem JWT)
    return NextResponse.json({ message: "Login realizado com sucesso!", user });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({error: "Check the info"}, { status: 500 });
  }
}
