import { useState } from "react";
import Link from "next/link"; // Import the Link component

export default function Home() {
  const [role, setRole] = useState<"moverCompany" | "client" | null>(null);

  return (
    <div className="bg-[#f9f6ff] text-[#333] min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#6a0dad] text-white text-center py-6 shadow-md">
        <h1 className="text-3xl font-bold tracking-wide">Mover Connection Portal</h1>
        <p className="text-lg mt-2">Your one-stop solution for all moving needs</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Landing Page */}
        {!role && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome to Mover Connection Portal
            </h2>
            <p className="text-lg mb-6">Select your role to continue:</p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-[#6a0dad] text-white px-6 py-2 rounded shadow-md hover:bg-purple-700 transition"
                onClick={() => setRole("moverCompany")}
              >
                I am a Mover Company
              </button>
              <button
                className="bg-[#ff8c00] text-white px-6 py-2 rounded shadow-md hover:bg-orange-600 transition"
                onClick={() => setRole("client")}
              >
                I am Looking for a Mover
              </button>
            </div>
          </div>
        )}

        {/* Mover Company Interface */}
        {role === "moverCompany" && (
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#6a0dad] mb-4">
              Mover Company Dashboard
            </h2>
            <p className="text-lg">
              Manage your services, bookings, and reviews here.
            </p>
            <button
              className="mt-6 bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
              onClick={() => setRole(null)}
            >
              Go Back
            </button>
          </section>
        )}

        {/* Client Interface */}
        {role === "client" && (
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#6a0dad] mb-4">
              Find a Mover
            </h2>
            <p className="text-lg">
              Search for reliable moving services in your area.
            </p>
            {/* Navigation Button */}
            <Link href="/Client">
              <button className="mt-6 bg-[#ff8c00] text-white px-6 py-2 rounded hover:bg-orange-600 transition">
                Go to Client Page
              </button>
            </Link>
            <button
              className="mt-4 bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
              onClick={() => setRole(null)}
            >
              Go Back
            </button>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#6a0dad] text-white text-center py-4">
        <p>&copy; {new Date().getFullYear()} Mover Connection Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
