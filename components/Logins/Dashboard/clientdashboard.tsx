import React, { useState } from "react";

interface Mover {
  id: string;
  name: string;
  contact: string;
  status: "available" | "accepted" | "declined";
}

const ClientDashboard: React.FC = () => {
  const [movers, setMovers] = useState<Mover[]>([
    // Example data - replace with Firebase data in the future
    { id: "1", name: "John Doe", contact: "123-456-7890", status: "available" },
    { id: "2", name: "Jane Smith", contact: "987-654-3210", status: "accepted" },
    { id: "3", name: "Mark Wilson", contact: "456-123-7890", status: "declined" },
    { id: "4", name: "Emily Davis", contact: "321-654-9870", status: "available" },
  ]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderMovers = (status: Mover["status"]) => {
    const filteredMovers = movers.filter(
      (mover) =>
        mover.status === status &&
        mover.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredMovers.length === 0) {
      return <p className="text-gray-400">No movers in this category.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovers.map((mover) => (
          <div
            key={mover.id}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-5 shadow-lg hover:scale-105 transform transition-all duration-300"
          >
            <h3 className="text-xl font-bold text-white">{mover.name}</h3>
            <p className="text-sm text-gray-300">
              <strong>Contact:</strong> {mover.contact}
            </p>
            <p
              className={`text-sm mt-2 ${
                status === "available"
                  ? "text-green-400"
                  : status === "accepted"
                  ? "text-blue-400"
                  : "text-red-400"
              }`}
            >
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-6">
      <h1 className="text-4xl font-extrabold text-center mb-10">Client Dashboard</h1>

      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search movers by name..."
          className="w-full sm:w-1/2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Available Movers</h2>
        {renderMovers("available")}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Movers Who Accepted Requests</h2>
        {renderMovers("accepted")}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Movers Who Declined Requests</h2>
        {renderMovers("declined")}
      </section>
    </div>
  );
};

export default ClientDashboard;
