"use client";

import { useRouter } from "next/navigation";



export default function MobileFeatures() {
 
  const router = useRouter()

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <button onClick={() => router.push("/checkin")}className="px-4 py-2 bg-blue-500 text-white rounded">
        Check-In
      </button>
      <button onClick={() => router.push("/checkout")}className="px-4 py-2 bg-blue-500 text-white rounded">
        Check-Out
      </button>
    </div>
  );
}
