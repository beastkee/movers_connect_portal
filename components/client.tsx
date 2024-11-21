import { useState } from "react";

export default function ClientPage() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-purple-700 text-center mb-6">
          Find a Mover
        </h2>
        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="location" className="block font-medium mb-2">
              Pickup Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Enter pickup location"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="destination" className="block font-medium mb-2">
              Drop-off Location
            </label>
            <input
              type="text"
              id="destination"
              name="destination"
              placeholder="Enter drop-off location"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-purple-700 text-white font-medium py-2 rounded-lg hover:scale-105 transition transform"
          >
            Submit Request
          </button>
        </form>
      </div>

      {/* Popup */}
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <h3 className="text-xl font-bold text-purple-700 mb-4">
              Thank you for your request!
            </h3>
            <p className="text-gray-700 mb-6">
              We will connect you with the best movers in your area shortly.
            </p>
            <button
              onClick={closePopup}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
