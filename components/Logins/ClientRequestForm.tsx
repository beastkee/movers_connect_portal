import { useState } from "react";
import { useRouter } from "next/router";

export default function ClientRequestForm() {
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#0a1024] via-[#111b3d] to-[#090f20] text-[#e8ecff]">
      {/* Header */}
      <header className="border-b border-[#7ba1ff]/35 bg-[#0f1834]/85 py-6 text-center text-white shadow-md backdrop-blur-sm">
        <h1 className="text-3xl font-bold tracking-wide">Find a Mover</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-[#7ba1ff]/35 bg-[#0f1834]/85 p-6 shadow-[0_20px_50px_rgba(3,7,20,0.55)] backdrop-blur-sm">
          <h2 className="mb-6 text-center text-2xl font-bold text-[#d8e2ff]">
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
                className="w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] px-4 py-2 text-[#eef2ff] placeholder-[#95a5d3]"
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
                className="w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] px-4 py-2 text-[#eef2ff] placeholder-[#95a5d3]"
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
                className="w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] px-4 py-2 text-[#eef2ff] placeholder-[#95a5d3]"
                placeholder="Enter drop-off location"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#7ba1ff] py-2 font-bold text-[#08112b] transition hover:bg-[#9bb7ff]"
            >
              Submit Request
            </button>
          </form>
        </div>
      </main>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/55">
          <div className="rounded-2xl border border-[#7ba1ff]/35 bg-[#0f1834]/90 p-6 text-center shadow-[0_20px_50px_rgba(3,7,20,0.55)]">
            <h3 className="mb-4 text-2xl font-bold text-[#d8e2ff]">
              Thank You!
            </h3>
            <p className="mb-6 text-lg text-[#d0dbff]">
              We will connect you with the best movers in your area shortly.
            </p>
            <button
              onClick={handleClosePopup}
              className="rounded-lg bg-[#7ba1ff] px-6 py-2 font-bold text-[#08112b] transition hover:bg-[#9bb7ff]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#7ba1ff]/35 bg-[#0f1834]/85 py-4 text-center text-white">
        <p>&copy; {new Date().getFullYear()} Mover Connection Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
