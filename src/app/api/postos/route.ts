import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Defina a URL do seu MongoDB local (ajuste conforme necessário)
const MONGO_URI = "mongodb://localhost:27017/lifeguard";

let PostoModel: mongoose.Model<any>;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(MONGO_URI, { dbName: "lifeguard" });

  const schema = new mongoose.Schema({
    nome: String,
    latitude: String,
    longitude: String
  });

  PostoModel = mongoose.models.Posto || mongoose.model("Posto", schema);
}

export async function GET() {
  try {
    await connectDB();
    const postos = await PostoModel.find();
    return NextResponse.json(postos);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar os postos" }, { status: 500 });
  }
}
