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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-800/50 to-blue-800/50 backdrop-blur-sm border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Mover Dashboard</h1>
              <p className="text-blue-200">Manage your bookings and view client requests</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-blue-200">Logged in as</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            onClick={() => setShowBookings((prev) => !prev)}
          >
            📋 {showBookings ? "Hide My Bookings" : "Show My Bookings"} ({bookings.length})
          </button>
          <button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            onClick={() => {
              setShowCreds((prev) => !prev);
              if (!showCreds) fetchCredentials();
            }}
          >
            📄 {showCreds ? "Hide My Credentials" : "Show My Credentials"}
          </button>
        </div>
        {showBookings && (
          <div className="mb-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-semibold">
                {bookings.length} Total
              </span>
            </div>
            {bookings.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{b.clientEmail}</p>
                        <p className="text-sm text-gray-400">
                          📅 {b.date} • ⏰ {b.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          b.status === "accepted" ? "bg-green-500/20 text-green-300" :
                          b.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                          "bg-red-500/20 text-red-300"
                        }`}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                        {b.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg"
                              onClick={async () => {
                                await updateDoc(doc(db, "bookings", b.id), { status: "accepted" });
                              }}
                            >✓ Accept</button>
                            <button
                              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg"
                              onClick={async () => {
                                await updateDoc(doc(db, "bookings", b.id), { status: "declined" });
                              }}
                            >✗ Decline</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {showCreds && (
          <div className="mb-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Uploaded Credentials</h2>
              <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">
                {credentials.length} Files
              </span>
            </div>
            {loadingCreds ? (
              <p className="text-gray-400 text-center py-8">Loading...</p>
            ) : credentials.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No credentials uploaded.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {credentials.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-blue-500/50 transition-all flex items-center gap-3 group"
                  >
                    <div className="bg-blue-500/20 w-10 h-10 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📄</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold group-hover:text-blue-300 transition-colors">Document {idx + 1}</p>
                      <p className="text-xs text-gray-400">Click to view</p>
                    </div>
                    <span className="text-blue-400">→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="🔍 Search client requests by name..."
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none backdrop-blur-sm shadow-lg"
            />
          </div>
        </div>

        {/* Client Requests Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">📬 Client Requests</h2>
            <span className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold">
              {filteredRequests.length} Requests
            </span>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No client requests available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 hover:border-indigo-500/50 transform transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-indigo-500/20 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                    New
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{request.name}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-indigo-400">📍</span>
                    <span><strong>Address:</strong> {request.address}</span>
                  </p>
                  <p className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-indigo-400">📞</span>
                    <span><strong>Contact:</strong> {request.contact}</span>
                  </p>
                  <p className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-indigo-400">📝</span>
                    <span><strong>Description:</strong> {request.description}</span>
                  </p>
                  <p className="text-sm text-indigo-300 flex items-center gap-2">
                    <span>📅</span>
                    <span><strong>Date:</strong> {new Date(request.date).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoverDashboard;
