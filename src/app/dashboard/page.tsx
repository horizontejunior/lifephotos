import { Stations } from "@/components/stations";
import { getStations } from "@/services/get-stations";

// import Link from "next/link";

// export default function MobileFeatures() {
//   return (
//     <div className="flex flex-col items-center space-y-4 p-4">
//       <Link href="/checkin">
//         <button className="px-4 py-2 bg-primary text-white rounded">
//           Check-In
//         </button>
//       </Link>
//       <Link href="/checkout">
//         <button className="px-4 py-2 bg-blue-500 text-white rounded">
//           Check-Out
//         </button>
//       </Link>
//     </div>
//   );
// }

export default async function Dashboard() {
  const stations = await getStations();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-yellow-400 text-transparent bg-clip-text">
          Life App
        </h1>
        <p className="text-sm">Selecione um posto para continuar</p>
      </div>

      <Stations stations={stations} />
    </div>
  );
}
