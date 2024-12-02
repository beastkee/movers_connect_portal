import { useState } from "react";
import Link from "next/link";
import { FaTruckMoving, FaUserTie, FaArrowLeft, FaHome } from "react-icons/fa";

export default function Home() {
  const [role, setRole] = useState<"moverCompany" | "client" | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f2f7fa] via-[#eaeff3] to-[#f8f9fc] text-[#333] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6a0dad]/80 to-[#9b5fe0]/80 backdrop-blur-sm text-white text-center py-6 shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-md">
          <FaTruckMoving className="inline mr-2 text-3xl" />
          Mover Connection Portal
        </h1>
        <p className="text-lg mt-2 italic opacity-90">
          Your one-stop solution for all moving needs
        </p>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white/60 shadow-lg backdrop-blur-lg rounded-xl p-8 mx-6 mt-6 text-center">
        <h2 className="text-3xl font-semibold text-[#6a0dad] mb-4 drop-shadow-sm">
          Seamlessly Connect Movers and Clients
        </h2>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Experience effortless moving services tailored to your needs. Join us today!
        </p>
        <div className="relative w-full flex justify-center">
          <img
            src="/hero-image.svg"
            alt="Moving Illustration"
            className="w-full max-w-lg transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="absolute -top-10 left-10 w-16 h-16 bg-gradient-to-br from-[#6a0dad] to-[#ff8c00]/80 rounded-full blur-xl opacity-30"></div>
        <div className="absolute -bottom-10 right-10 w-20 h-20 bg-gradient-to-tl from-[#ff8c00] to-[#6a0dad]/60 rounded-full blur-2xl opacity-40"></div>
      </section>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 space-y-8">
        {!role && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-[#333]">
              Welcome to Mover Connection Portal
            </h2>
            <p className="text-lg mb-6 text-gray-600">
              Choose your role to begin your journey:
            </p>
            <div className="flex justify-center space-x-6">
              <button
                className="flex items-center bg-gradient-to-br from-[#6a0dad] to-[#9b5fe0] text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transform transition"
                onClick={() => setRole("moverCompany")}
              >
                <FaUserTie className="mr-2" />
                I am a Mover Company
              </button>
              <button
                className="flex items-center bg-gradient-to-br from-[#ff8c00] to-[#f9a800] text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transform transition"
                onClick={() => setRole("client")}
              >
                <FaHome className="mr-2" />
                I am Looking for a Mover
              </button>
            </div>
          </div>
        )}

        {/* Mover Company Interface */}
        {role === "moverCompany" && (
          <section className="bg-white/60 p-8 rounded-xl shadow-md backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-[#6a0dad] mb-4">
              Mover Company Dashboard
            </h2>
            <p className="text-lg text-gray-700">
              Manage your services, bookings, and reviews all in one place.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link href="/register">
                <button className="bg-gradient-to-br from-[#ff8c00] to-[#f9a800] text-white px-6 py-3 rounded-full hover:scale-105 transform transition">
                  Go to Register Page
                </button>
              </Link>
              <button
                className="bg-gray-300/80 text-black px-6 py-3 rounded-full hover:bg-gray-400/90 transition"
                onClick={() => setRole(null)}
              >
                <FaArrowLeft className="mr-2" />
                Go Back
              </button>
            </div>
          </section>
        )}

        {/* Client Interface */}
        {role === "client" && (
          <section className="bg-white/60 p-8 rounded-xl shadow-md backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-[#6a0dad] mb-4">
              Find a Mover
            </h2>
            <p className="text-lg text-gray-700">
              Discover reliable moving services near you with ease.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link href="/Client">
                <button className="bg-gradient-to-br from-[#ff8c00] to-[#f9a800] text-white px-6 py-3 rounded-full hover:scale-105 transform transition">
                  Go to Client Page
                </button>
              </Link>
              <button
                className="bg-gray-300/80 text-black px-6 py-3 rounded-full hover:bg-gray-400/90 transition"
                onClick={() => setRole(null)}
              >
                <FaArrowLeft className="mr-2" />
                Go Back
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-tr from-[#6a0dad]/90 to-[#9b5fe0]/90 text-white text-center py-6 mt-auto">
        <p className="text-lg font-light">
          &copy; {new Date().getFullYear()} Mover Connection Portal. All rights reserved.
        </p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="hover:underline">Facebook</a>
          <a href="#" className="hover:underline">Twitter</a>
          <a href="#" className="hover:underline">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}
