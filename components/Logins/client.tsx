import { useState } from "react";
import { useRouter } from "next/router";

export default function ClientPage() {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter(); // Initialize the router for navigation

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission
    setShowPopup(true); // Show the popup
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Close the popup
    router.push("/"); // Redirect to the home page
  };

  return (
    <div className="bg-[#f9f6ff] text-[#333] min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#6a0dad] text-white text-center py-6 shadow-md">
        <h1 className="text-3xl font-bold tracking-wide">Find a Mover</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#6a0dad] mb-6 text-center">
            Request a Moving Service
          </h2>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block font-semibold mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border rounded"
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="location" className="block font-semibold mb-2">
                Pickup Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full px-4 py-2 border rounded"
                placeholder="Enter pickup location"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="destination" className="block font-semibold mb-2">
                Drop-off Location
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                className="w-full px-4 py-2 border rounded"
                placeholder="Enter drop-off location"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#ff8c00] text-white py-2 rounded hover:bg-orange-600 transition"
            >
              Submit Request
            </button>
          </form>
        </div>
      </main>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-bold text-[#6a0dad] mb-4">
              Thank You!
            </h3>
            <p className="text-lg mb-6">
              We will connect you with the best movers in your area shortly.
            </p>
            <button
              onClick={handleClosePopup}
              className="bg-[#6a0dad] text-white px-6 py-2 rounded hover:bg-purple-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#6a0dad] text-white text-center py-4">
        <p>&copy; {new Date().getFullYear()} Mover Connection Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
