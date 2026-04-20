import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collectionGroup, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { isAdminEmail } from "@/firebase/adminConfig";

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
  const [moverSearch, setMoverSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [moverSort, setMoverSort] = useState<"newest" | "oldest" | "name-asc" | "name-desc" | "status">("newest");
  const [clientSort, setClientSort] = useState<"newest" | "oldest" | "name-asc" | "name-desc">("newest");
  const [showNotesModal, setShowNotesModal] = useState<{ open: boolean; mover: MoverData | null }>({ open: false, mover: null });
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const auth = typeof window !== "undefined" ? getAuth() : null;
  const user = auth?.currentUser;
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to be ready
    if (!user) {
      router.push("/adminlogin");
      return;
    }
    
    // Check if user is admin
    if (!isAdminEmail(user.email)) {
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

  const toMillis = (value: any) => {
    const date = value?.toDate?.();
    return date instanceof Date ? date.getTime() : 0;
  };

  const filteredMovers = movers.filter((m) => {
    const matchesFilter = filter === "all" ? true : m.verificationStatus === filter;
    const search = moverSearch.trim().toLowerCase();
    const matchesSearch =
      search.length === 0 ||
      m.companyName.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search) ||
      m.serviceArea.toLowerCase().includes(search) ||
      m.contactNumber.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });

  const statusRank: Record<MoverData["verificationStatus"], number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
  };

  const sortedMovers = [...filteredMovers].sort((a, b) => {
    if (moverSort === "name-asc") return a.companyName.localeCompare(b.companyName);
    if (moverSort === "name-desc") return b.companyName.localeCompare(a.companyName);
    if (moverSort === "oldest") return toMillis(a.createdAt) - toMillis(b.createdAt);
    if (moverSort === "status") {
      return statusRank[a.verificationStatus] - statusRank[b.verificationStatus];
    }
    return toMillis(b.createdAt) - toMillis(a.createdAt);
  });

  const filteredClients = clients.filter((c) => {
    const search = clientSearch.trim().toLowerCase();
    if (search.length === 0) return true;
    return (
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.number.toLowerCase().includes(search)
    );
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (clientSort === "name-asc") return a.name.localeCompare(b.name);
    if (clientSort === "name-desc") return b.name.localeCompare(a.name);
    if (clientSort === "oldest") return toMillis(a.createdAt) - toMillis(b.createdAt);
    return toMillis(b.createdAt) - toMillis(a.createdAt);
  });

  const moverCounts = {
    all: movers.length,
    pending: movers.filter((m) => m.verificationStatus === "pending").length,
    approved: movers.filter((m) => m.verificationStatus === "approved").length,
    rejected: movers.filter((m) => m.verificationStatus === "rejected").length,
  };

  const statusClasses: Record<MoverData["verificationStatus"], string> = {
    approved: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
    rejected: "bg-rose-500/15 text-rose-300 border border-rose-400/30",
    pending: "bg-amber-500/15 text-amber-300 border border-amber-400/30",
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-white text-xl">Please login as admin</p>
      </div>
    );
  }

  if (user && !isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-red-500 text-xl">Access Denied - Admin Only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Operations Center</p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Admin Dashboard</h1>
              <p className="mt-2 text-slate-300">Review mover verification, manage users, and keep the marketplace healthy.</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-cyan-200">Signed In As</p>
              <p className="mt-1 text-sm font-semibold text-cyan-100">{user.email || "Admin"}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total Movers</p>
            <p className="mt-1 text-2xl font-bold">{moverCounts.all}</p>
          </div>
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
            <p className="text-xs uppercase tracking-wider text-amber-200">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-100">{moverCounts.pending}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-wider text-emerald-200">Approved</p>
            <p className="mt-1 text-2xl font-bold text-emerald-100">{moverCounts.approved}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Clients</p>
            <p className="mt-1 text-2xl font-bold">{clients.length}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3 backdrop-blur">
          <button
            onClick={() => setActiveTab("movers")}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === "movers"
                ? "bg-cyan-500 text-slate-950"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Movers ({movers.length})
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === "clients"
                ? "bg-emerald-500 text-slate-950"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Clients ({clients.length})
          </button>
        </div>

        {activeTab === "movers" && (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === item
                      ? "bg-slate-100 text-slate-950"
                      : "border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)} ({moverCounts[item]})
                </button>
              ))}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={moverSearch}
                onChange={(e) => setMoverSearch(e.target.value)}
                placeholder="Search movers by company, email, area, or phone"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <select
                value={moverSort}
                onChange={(e) => setMoverSort(e.target.value as "newest" | "oldest" | "name-asc" | "name-desc" | "status")}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="newest">Sort: Newest first</option>
                <option value="oldest">Sort: Oldest first</option>
                <option value="name-asc">Sort: Name A-Z</option>
                <option value="name-desc">Sort: Name Z-A</option>
                <option value="status">Sort: Status (Pending first)</option>
              </select>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                <p className="text-lg text-slate-300 animate-pulse">Loading mover profiles...</p>
              </div>
            ) : sortedMovers.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                <p className="text-lg text-slate-300">No movers found in this filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedMovers.map((mover) => (
                  <div
                    key={mover.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-xl transition hover:border-cyan-400/40"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-bold tracking-tight">{mover.companyName}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusClasses[mover.verificationStatus]}`}>
                            {mover.verificationStatus}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm text-slate-300 sm:grid-cols-2">
                          <p>Email: {mover.email}</p>
                          <p>Phone: {mover.contactNumber}</p>
                          <p>Service Area: {mover.serviceArea}</p>
                          <p>Registered: {mover.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}</p>
                        </div>

                        {mover.adminNotes && (
                          <div className="mt-4 rounded-xl border border-cyan-300/25 bg-cyan-500/10 p-3">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">Admin Notes</p>
                            <p className="text-sm text-slate-200">{mover.adminNotes}</p>
                          </div>
                        )}

                        <div className="mt-4 border-t border-white/10 pt-4">
                          <p className="mb-2 text-sm font-semibold text-slate-200">Credentials</p>
                          {mover.credentials.length === 0 ? (
                            <p className="text-sm text-slate-400">No credentials uploaded.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {mover.credentials.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                                >
                                  Document {idx + 1}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto">
                        {mover.verificationStatus === "pending" && (
                          <>
                            <button
                              onClick={() => handleVerificationUpdate(mover, "approved")}
                              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerificationUpdate(mover, "rejected")}
                              className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-400"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openNotesModal(mover)}
                          className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                        >
                          Add/Edit Notes
                        </button>
                        <button
                          onClick={() => handleDeleteMover(mover)}
                          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "clients" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search clients by name, email, or phone"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <select
                value={clientSort}
                onChange={(e) => setClientSort(e.target.value as "newest" | "oldest" | "name-asc" | "name-desc")}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="newest">Sort: Newest first</option>
                <option value="oldest">Sort: Oldest first</option>
                <option value="name-asc">Sort: Name A-Z</option>
                <option value="name-desc">Sort: Name Z-A</option>
              </select>
            </div>

            {sortedClients.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                <p className="text-lg text-slate-300">No clients registered yet.</p>
              </div>
            ) : (
              sortedClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-xl transition hover:border-emerald-400/40"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{client.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-slate-300">
                        <p>Email: {client.email}</p>
                        <p>Phone: {client.number}</p>
                        <p>Registered: {client.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClient(client)}
                      className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-400"
                    >
                      Delete Client
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal.open && showNotesModal.mover && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black tracking-tight">Admin Notes</h3>
                <button
                  onClick={() => setShowNotesModal({ open: false, mover: null })}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <p className="mb-4 text-slate-300">
                Notes for <span className="font-semibold text-white">{showNotesModal.mover.companyName}</span>
              </p>

              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add recommendations, feedback, or notes for this mover..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                rows={6}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex-1 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
                <button
                  onClick={() => setShowNotesModal({ open: false, mover: null })}
                  className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
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
