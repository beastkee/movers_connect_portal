import { useRouter } from "next/router";
import { useState } from "react";

const RolesPage = () => {
  const router = useRouter();
  const [isDarkMode, setDarkMode] = useState(false);

  const handleRoleSelection = (role: "client" | "mover") => {
    if (role === "client") {
      router.push("/client-register");
    } else if (role === "mover") {
      router.push("/mover-register");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${
        isDarkMode
          ? "bg-gradient-to-r from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      } relative`}
    >
      {/* Light/Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-white text-gray-800 shadow-md hover:bg-gray-200"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? "☀️" : "🌙"}
      </button>

      {/* Header */}
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 mb-8 animate-gradient-text">
        Choose Your Role
      </h1>

      {/* Subtext */}
      <p className="text-lg text-gray-200 mb-12 animate-fade-in delay-200 text-center max-w-md">
        Are you joining as a <strong>Client</strong> or a <strong>Mover</strong>? Select your role to continue.
      </p>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
        <button
          onClick={() => handleRoleSelection("client")}
          className="px-8 py-4 text-lg font-medium bg-white text-indigo-600 rounded-full shadow-xl hover:shadow-2xl hover:bg-indigo-600 hover:text-white transition duration-300 transform hover:scale-110 flex items-center space-x-3 group"
        >
          <span className="text-2xl">🧑‍💼</span>
          <span className="group-hover:underline">Register as Client</span>
        </button>
        <button
          onClick={() => handleRoleSelection("mover")}
          className="px-8 py-4 text-lg font-medium bg-white text-pink-600 rounded-full shadow-xl hover:shadow-2xl hover:bg-pink-600 hover:text-white transition duration-300 transform hover:scale-110 flex items-center space-x-3 group"
        >
          <span className="text-2xl">📦</span>
          <span className="group-hover:underline">Register as Mover</span>
        </button>
      </div>
      
      <div
        className="absolute inset-0 bg-gradient-to-t from-transparent to-black opacity-20 pointer-events-none animate-pulse"
        aria-hidden="true"
      ></div>
    </div>
  );
};

export default RolesPage;
