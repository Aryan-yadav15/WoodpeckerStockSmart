import Image from "next/image";
import Link from "next/image";

export default function Home() {
  return (
    <div className="p-10">
      <div className="bg-gray-800 rounded-lg px-4 py-2 flex justify-center">
        <a href="/dashboard" className="text-center text-white">
          Continue to dashboard
        </a>
      </div>
    </div>
  );
}
