import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, collectionGroup, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";

interface MoverData {
  id: string;
  uid: string;
  companyName: string;
  serviceArea: string;
  contactNumber: string;
  email: string;
  credentials: string[];
  verificationStatus: "pending" | "approved" | "rejected";
  createdAt: any;
}

const AdminDashboard: React.FC = () => {
  const [movers, setMovers] = useState<MoverData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const auth = typeof window !== "undefined" ? getAuth() : null;
  const user = auth?.currentUser;
  const router = useRouter();

  // Admin emails - replace with your admin email(s)
  const adminEmails = ["admin@moversconnect.com", "beastkee@example.com"];

  useEffect(() => {
    // Check if user is admin
    if (user && !adminEmails.includes(user.email || "")) {
      alert("Access denied. Admin only.");
      router.push("/");
      return;
    }

    fetchMovers();
  }, [user]);

  const fetchMovers = async () => {
    setLoading(true);
    try {
      const moversQuery = collectionGroup(db, "movers");
      const snapshot = await getDocs(moversQuery);
      
      const moversData: MoverData[] = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        // Extract userId from document path (users/{userId}/movers/{docId})
        const pathParts = doc.ref.path.split('/');
        const userId = pathParts[1];
        
        return {
          id: doc.id,
          uid: userId,
          companyName: data.companyName || "N/A",
          serviceArea: data.serviceArea || "N/A",
          contactNumber: data.contactNumber || "N/A",
          email: data.email || "N/A",
          credentials: data.credentials || [],
          verificationStatus: data.verificationStatus || "pending",
          createdAt: data.createdAt,
        };
      });

      setMovers(moversData);
    } catch (error) {
      console.error("Error fetching movers:", error);
      alert("Failed to fetch movers");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationUpdate = async (
    mover: MoverData,
    status: "approved" | "rejected"
  ) => {
    try {
      const moverRef = doc(db, "users", mover.uid, "movers", mover.id);
      await updateDoc(moverRef, {
        verificationStatus: status,
        verifiedAt: new Date(),
        verifiedBy: user?.email,
      });

      alert(`Mover ${status === "approved" ? "approved" : "rejected"} successfully!`);
      fetchMovers(); // Refresh list
    } catch (error) {
      console.error("Error updating verification status:", error);
      alert("Failed to update verification status");
    }
  };

  const filteredMovers = movers.filter(m => 
    filter === "all" ? true : m.verificationStatus === filter
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-white text-xl">Please login as admin</p>
      </div>
    );
  }

  if (user && !adminEmails.includes(user.email || "")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-red-500 text-xl">Access Denied - Admin Only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            🛡️ Admin Dashboard
          </h1>
          <p className="text-gray-400">Manage mover verifications and credentials</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === "all"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            All ({movers.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === "pending"
                ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Pending ({movers.filter(m => m.verificationStatus === "pending").length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === "approved"
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Approved ({movers.filter(m => m.verificationStatus === "approved").length})
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === "rejected"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Rejected ({movers.filter(m => m.verificationStatus === "rejected").length})
          </button>
        </div>

        {/* Movers List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 animate-pulse">Loading movers...</p>
          </div>
        ) : filteredMovers.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-xl text-gray-400">No movers in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMovers.map((mover) => (
              <div
                key={mover.id}
                className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">{mover.companyName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          mover.verificationStatus === "approved"
                            ? "bg-green-500/20 text-green-300"
                            : mover.verificationStatus === "rejected"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {mover.verificationStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1 text-gray-300">
                      <p>📧 {mover.email}</p>
                      <p>📱 {mover.contactNumber}</p>
                      <p>📍 {mover.serviceArea}</p>
                      <p className="text-sm text-gray-400">
                        📅 Registered: {mover.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {mover.verificationStatus === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerificationUpdate(mover, "approved")}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl font-semibold transition-all"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleVerificationUpdate(mover, "rejected")}
                        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-2 rounded-xl font-semibold transition-all"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Credentials */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="font-semibold mb-2">📄 Credentials:</h4>
                  {mover.credentials.length === 0 ? (
                    <p className="text-gray-400 text-sm">No credentials uploaded yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {mover.credentials.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          View Document {idx + 1} →
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
