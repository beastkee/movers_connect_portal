import React, { useState } from "react";

interface ClientRequest {
  id: string;
  name: string;
  address: string;
  contact: string;
  description: string;
  date: string;
}

const MoverDashboard: React.FC = () => {
  const [requests, setRequests] = useState<ClientRequest[]>([
    // Example data - replace this with Firebase data in the future
    {
      id: "1",
      name: "Alice Johnson",
      address: "123 Main Street",
      contact: "123-456-7890",
      description: "Need help moving furniture to a new apartment.",
      date: "2024-12-05",
    },
    {
      id: "2",
      name: "Bob Smith",
      address: "456 Oak Lane",
      contact: "987-654-3210",
      description: "Relocating a small office.",
      date: "2024-12-10",
    },
    {
      id: "3",
      name: "Eve Martinez",
      address: "789 Pine Road",
      contact: "456-123-7890",
      description: "Assistance with packing and loading for a house move.",
      date: "2024-12-08",
    },
  ]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredRequests = requests.filter((request) =>
    request.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-6">
      <h1 className="text-4xl font-extrabold text-center mb-10">Mover Dashboard</h1>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search client requests by name..."
          className="w-full sm:w-1/2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Requests */}
      {filteredRequests.length === 0 ? (
        <p className="text-gray-400 text-center">
          No client requests available at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-5 shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-white">{request.name}</h3>
              <p className="text-sm text-gray-300">
                <strong>Address:</strong> {request.address}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Contact:</strong> {request.contact}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Description:</strong> {request.description}
              </p>
              <p className="text-sm text-indigo-400">
                <strong>Date:</strong> {new Date(request.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoverDashboard;
