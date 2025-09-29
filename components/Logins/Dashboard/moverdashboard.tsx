import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collectionGroup, onSnapshot, QuerySnapshot, DocumentData, doc, getDoc, collection, query, where, onSnapshot as onSnapshot2, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

interface ClientRequest {
  id: string;
  name: string;
  address: string;
  contact: string;
  description: string;
  date: string;
}

const MoverDashboard: React.FC = () => {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [showCreds, setShowCreds] = useState(false);
  const [credentials, setCredentials] = useState<string[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [showBookings, setShowBookings] = useState(false);
  const auth = typeof window !== "undefined" ? getAuth() : null;
  const user = auth?.currentUser;
  // Fetch bookings for this mover
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "bookings"), where("moverId", "==", user.uid));
    const unsub = onSnapshot2(q, (snapshot: any) => {
      setBookings(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);


  useEffect(() => {
    // Listen for all clients in nested subcollections using collectionGroup
    const unsub = onSnapshot(collectionGroup(db, "clients"), (snapshot: any) => {
      const reqs: ClientRequest[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(reqs);
    });
    return () => unsub();
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredRequests = requests.filter((request) =>
    request.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch mover credentials from Firestore
  const fetchCredentials = async () => {
    if (!user) return;
    setLoadingCreds(true);
    try {
      const docRef = doc(db, "users", user.uid, "movers", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCredentials(data.credentials || []);
      } else {
        setCredentials([]);
      }
    } catch {
      setCredentials([]);
    } finally {
      setLoadingCreds(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-6">
      <h1 className="text-4xl font-extrabold text-center mb-10">Mover Dashboard</h1>

      {/* Show Bookings Button */}
      <div className="flex justify-end mb-4 gap-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
          onClick={() => setShowBookings((prev) => !prev)}
        >
          {showBookings ? "Hide My Bookings" : "Show My Bookings"}
        </button>
      </div>
      {showBookings && (
        <div className="mb-8 bg-white/10 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">My Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            <ul className="list-disc ml-6">
              {bookings.map((b, idx) => (
                <li key={idx} className="mb-2">
                  <span className="font-semibold">{b.clientEmail}</span> — {b.date} {b.time} (<span className="capitalize">{b.status}</span>)
                  {b.status === "pending" && (
                    <>
                      <button
                        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                        onClick={async () => {
                          await updateDoc(doc(db, "bookings", b.id), { status: "accepted" });
                        }}
                      >Accept</button>
                      <button
                        className="ml-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                        onClick={async () => {
                          await updateDoc(doc(db, "bookings", b.id), { status: "declined" });
                        }}
                      >Decline</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          onClick={() => {
            setShowCreds((prev) => !prev);
            if (!showCreds) fetchCredentials();
          }}
        >
          {showCreds ? "Hide My Credentials" : "Show My Credentials"}
        </button>
      </div>
      {showCreds && (
        <div className="mb-8 bg-white/10 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">My Uploaded Credentials</h2>
          {loadingCreds ? (
            <p>Loading...</p>
          ) : credentials.length === 0 ? (
            <p>No credentials uploaded.</p>
          ) : (
            <ul className="list-disc ml-6">
              {credentials.map((url, idx) => (
                <li key={idx}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">Document {idx + 1}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
