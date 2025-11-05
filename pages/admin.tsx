import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, collectionGroup, getDocs, doc, updateDoc, deleteDoc, query, where, addDoc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
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
  adminNotes?: string;
  createdAt: any;
}

interface ClientData {
  id: string;
  uid: string;
  name: string;
  number: string;
  email: string;
  createdAt: any;
}

const AdminDashboard: React.FC = () => {
  const [movers, setMovers] = useState<MoverData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"movers" | "clients">("movers");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState<{ open: boolean; mover: MoverData | null }>({ open: false, mover: null });
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const auth = typeof window !== "undefined" ? getAuth() : null;
  const user = auth?.currentUser;
  const router = useRouter();

  // Admin emails - replace with your admin email(s)
  const adminEmails = [
    "admin@admin.com",           // Default admin for testing
    "admin@moversconnect.com", 
    "beastkee@example.com"
  ];

  useEffect(() => {
    // Wait for auth to be ready
    if (!user) {
      router.push("/adminlogin");
      return;
    }
    
    // Check if user is admin
    if (!adminEmails.includes(user.email || "")) {
      alert("Access denied. Admin only.");
      router.push("/adminlogin");
      return;
    }

    fetchMovers();
    fetchClients();
  }, [user, router]);

  const fetchMovers = async () => {
    if (!user) return; // Safety check
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
          adminNotes: data.adminNotes || "",
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

  const fetchClients = async () => {
    if (!user) return; // Safety check
    try {
      const clientsQuery = collectionGroup(db, "clients");
      const snapshot = await getDocs(clientsQuery);
      
      const clientsData: ClientData[] = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        const pathParts = doc.ref.path.split('/');
        const userId = pathParts[1];
        
        return {
          id: doc.id,
          uid: userId,
          name: data.name || "N/A",
          number: data.number || "N/A",
          email: data.email || "N/A",
          createdAt: data.createdAt,
        };
      });

      setClients(clientsData);
    } catch (error) {
      console.error("Error fetching clients:", error);
      alert("Failed to fetch clients");
    }
  };

  const handleVerificationUpdate = async (
    mover: MoverData,
    status: "approved" | "rejected"
  ) => {
    if (!user) {
      alert("Session expired. Please login again.");
      return;
    }

    try {
      const moverRef = doc(db, "users", mover.uid, "movers", mover.id);
      await updateDoc(moverRef, {
        verificationStatus: status,
        verifiedAt: new Date(),
        verifiedBy: user?.email,
      });

      alert(`Mover ${status === "approved" ? "approved" : "rejected"} successfully!`);
      await fetchMovers(); // Refresh list
    } catch (error) {
      console.error("Error updating verification status:", error);
      alert("Failed to update verification status");
    }
  };

  const handleDeleteMover = async (mover: MoverData) => {
    if (!user) {
      alert("Session expired. Please login again.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${mover.companyName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const moverRef = doc(db, "users", mover.uid, "movers", mover.id);
      await deleteDoc(moverRef);
      alert("Mover deleted successfully!");
      await fetchMovers();
    } catch (error) {
      console.error("Error deleting mover:", error);
      alert("Failed to delete mover");
    }
  };

  const handleDeleteClient = async (client: ClientData) => {
    if (!user) {
      alert("Session expired. Please login again.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const clientRef = doc(db, "users", client.uid, "clients", client.id);
      await deleteDoc(clientRef);
      alert("Client deleted successfully!");
      await fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client");
    }
  };

  const handleSaveNotes = async () => {
    if (!showNotesModal.mover || !user) {
      alert("Session expired. Please login again.");
      return;
    }

    setSavingNotes(true);
    try {
      const moverRef = doc(db, "users", showNotesModal.mover.uid, "movers", showNotesModal.mover.id);
      await updateDoc(moverRef, {
        adminNotes: adminNotes,
        notesUpdatedAt: new Date(),
        notesUpdatedBy: user?.email,
      });

      alert("Notes saved successfully!");
      setShowNotesModal({ open: false, mover: null });
      setAdminNotes("");
      await fetchMovers();
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const openNotesModal = (mover: MoverData) => {
    setShowNotesModal({ open: true, mover });
    setAdminNotes(mover.adminNotes || "");
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
          <p className="text-gray-400">Manage movers, clients, and verifications</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("movers")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "movers"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            🚚 Movers ({movers.length})
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "clients"
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            👤 Clients ({clients.length})
          </button>
        </div>

        {/* Movers Tab */}
        {activeTab === "movers" && (
          <>
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
                        {mover.adminNotes && (
                          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-sm text-blue-300 font-semibold mb-1">📝 Admin Notes:</p>
                            <p className="text-sm text-gray-300">{mover.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        {mover.verificationStatus === "pending" && (
                          <>
                            <button
                              onClick={() => handleVerificationUpdate(mover, "approved")}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl font-semibold transition-all whitespace-nowrap"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleVerificationUpdate(mover, "rejected")}
                              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-2 rounded-xl font-semibold transition-all whitespace-nowrap"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openNotesModal(mover)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-semibold transition-all whitespace-nowrap"
                        >
                          📝 Add/Edit Notes
                        </button>
                        <button
                          onClick={() => handleDeleteMover(mover)}
                          className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-6 py-2 rounded-xl font-semibold transition-all whitespace-nowrap"
                        >
                          🗑️ Delete
                        </button>
                      </div>
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
                              📎 View Document {idx + 1} →
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Clients Tab */}
        {activeTab === "clients" && (
          <div className="space-y-4">
            {clients.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xl text-gray-400">No clients registered yet</p>
              </div>
            ) : (
              clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{client.name}</h3>
                      <div className="space-y-1 text-gray-300">
                        <p>📧 {client.email}</p>
                        <p>📱 {client.number}</p>
                        <p className="text-sm text-gray-400">
                          📅 Registered: {client.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteClient(client)}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-2 rounded-xl font-semibold transition-all whitespace-nowrap"
                    >
                      🗑️ Delete Client
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal.open && showNotesModal.mover && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">📝 Admin Notes</h3>
                <button
                  onClick={() => setShowNotesModal({ open: false, mover: null })}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <p className="text-gray-400 mb-4">
                Notes for: <span className="text-white font-semibold">{showNotesModal.mover.companyName}</span>
              </p>

              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add recommendations, feedback, or notes for this mover..."
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 resize-none"
                rows={6}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingNotes ? "Saving..." : "💾 Save Notes"}
                </button>
                <button
                  onClick={() => setShowNotesModal({ open: false, mover: null })}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
