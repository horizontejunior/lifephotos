"use client";
import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const CheckIn = ({ distance }: { distance: number }) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const defaultStation = {
    name: "default_station",
    latitude: 0,
    longitude: 0,
  };

  const handleSelectStation = async () => {
    setError(null);
    setSuccessMessage(null);

    try {

      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro desconhecido na geolocalização"
      );
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (!event.target.files?.[0]) return;

    setIsProcessing(true);
    const file = event.target.files[0];

    try {

      console.log("Passou aqui: iniciando processamento da foto");

      const mimeType = file.type || "image/jpeg";
  
      const extFromName = file.name.split(".").pop()?.toLowerCase();
      const ext = extFromName || mimeType.split("/")[1] || "jpg";


      const cleanStationName = defaultStation.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();
      const fileName = `${cleanStationName}_${Date.now()}.${ext}`;

      console.log("Passou aqui: iniciando o upload para o bucket com arquivo:", fileName);

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file, {
          contentType: mimeType,
          cacheControl: "public",
        });
      
      if (uploadError)
        throw new Error(`Erro no upload: ${uploadError.message}`);


      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);


      const { error: dbError } = await supabase.from("photos").insert([
        {
          station_name: defaultStation.name,
          photo_url: urlData.publicUrl,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (dbError)
        throw new Error(`Erro no banco de dados: ${dbError.message}`);

      setSuccessMessage("Foto registrada com sucesso!");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {

      setTimeout(() => {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 1000);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleSelectStation}
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
        disabled={!!(distance && 800 <= distance) || !distance}
      >
        Check-In
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          ✅ {successMessage}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        capture="user" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
      />

      {isProcessing && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
          ⏳ Processando foto...
        </div>
      )}
    </div>
  );
};
