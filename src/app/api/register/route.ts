import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const supabase = createClient("https://rbknzfcuanmdutsipexz.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia256ZmN1YW5tZHV0c2lwZXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MTYzMzUsImV4cCI6MjA1NjE5MjMzNX0.wdqTZFCIX49oy7065GBdNuAvIPfBlwo41prIeCpJGSk");
    const { name, email, password } = await req.json();

    // Verifica se o e-mail já existe
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "E-mail já cadastrado!" }, { status: 400 });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insere o usuário no banco
    const { data, error } = await supabase.from("users").insert([
      { name, email, password: hashedPassword },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ message: "Usuário cadastrado com sucesso!", user: data });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ status: 500 });
  }
}
