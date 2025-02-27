import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export default function Prevention() {
  const router = useRouter();
  const { station } = router.query;

  const [morningPreventions, setMorningPreventions] = useState("");
  const [afternoonPreventions, setAfternoonPreventions] = useState("");
  const [morningJellyfish, setMorningJellyfish] = useState("");
  const [afternoonJellyfish, setAfternoonJellyfish] = useState("");

  useEffect(() => {
    if (!station) {
      router.push("/checkin");
    }
  }, [router, station]);

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    const { data, error } = await supabase.from("prevention").insert([
      {
        station,
        morning_prev: morningPreventions,
        afternoon_prev: afternoonPreventions,
        morning_jellyfish: morningJellyfish,
        afternoon_jellyfish: afternoonJellyfish,
      },
    ]);

    if (error) {
      console.error("Erro ao inserir dados:", error.message);
    } else {
      console.log("Dados inseridos com sucesso:", data);
      router.push("/chooseStation"); // Redireciona após salvar
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registro de Prevenções - {station}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Prevenções pela manhã:</label>
          <input
            type="text"
            value={morningPreventions}
            onChange={(e) => setMorningPreventions(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Prevenções pela tarde:</label>
          <input
            type="text"
            value={afternoonPreventions}
            onChange={(e) => setAfternoonPreventions(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Lesões por água-viva pela manhã:</label>
          <input
            type="text"
            value={morningJellyfish}
            onChange={(e) => setMorningJellyfish(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Lesões por água-viva pela tarde:</label>
          <input
            type="text"
            value={afternoonJellyfish}
            onChange={(e) => setAfternoonJellyfish(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Salvar</button>
      </form>
    </div>
  );
}
