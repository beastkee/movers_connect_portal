import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collectionGroup, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

type Mover = {
  id: string;
  uid: string;
  companyName: string;
  email: string;
  verificationStatus: "pending" | "approved" | "rejected";
};

const BrutalistAdminDashboard = () => {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collectionGroup(db, "movers"));
      const rows = snapshot.docs.map((d: any) => {
        const value = d.data() as Partial<Mover>;
        const parts = d.ref.path.split("/");
        return {
          id: d.id,
          uid: parts[1],
          companyName: value.companyName || "Unknown",
          email: value.email || "N/A",
          verificationStatus: value.verificationStatus || "pending",
        } as Mover;
      });
      setMovers(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    return {
      pending: movers.filter((m) => m.verificationStatus === "pending").length,
      approved: movers.filter((m) => m.verificationStatus === "approved").length,
      rejected: movers.filter((m) => m.verificationStatus === "rejected").length,
    };
  }, [movers]);

  const moderate = async (m: Mover, status: "approved" | "rejected") => {
    const ref = doc(db, "users", m.uid, "movers", m.id);
    await updateDoc(ref, { verificationStatus: status });
    await load();
  };

  return (
    <div className="min-h-screen bg-[#f1eee2] text-black">
      <div className="mx-auto max-w-6xl border-x-4 border-black">
        <header className="border-b-4 border-black bg-[#b8ff4a] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">Admin Console / Brutalist Preview</p>
          <h1 className="mt-1 text-4xl font-black uppercase">Verification Command</h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/admin-dashboard" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">
              Open Classic Dashboard
            </Link>
            <Link href="/brutalist" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">
              Back to Preview Hub
            </Link>
          </div>
        </header>

        <section className="grid border-b-4 border-black md:grid-cols-3">
          <div className="border-r-0 border-black bg-[#fff2bf] p-4 md:border-r-4">
            <p className="text-xs font-black uppercase">Pending</p>
            <p className="text-3xl font-black">{counts.pending}</p>
          </div>
          <div className="border-r-0 border-black bg-[#dffad6] p-4 md:border-r-4">
            <p className="text-xs font-black uppercase">Approved</p>
            <p className="text-3xl font-black">{counts.approved}</p>
          </div>
          <div className="bg-[#ffdcd7] p-4">
            <p className="text-xs font-black uppercase">Rejected</p>
            <p className="text-3xl font-black">{counts.rejected}</p>
          </div>
        </section>

        <main>
          {loading ? (
            <div className="border-b-4 border-black bg-white p-8 text-sm font-bold uppercase">Loading queue...</div>
          ) : (
            movers.map((m) => (
              <article key={`${m.uid}-${m.id}`} className="border-b-4 border-black bg-white p-5 odd:bg-[#faf8f0]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-black uppercase">{m.companyName}</h2>
                    <p className="text-sm font-semibold">{m.email}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-wide">{m.verificationStatus}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moderate(m, "approved")}
                      className="border-4 border-black bg-black px-3 py-2 text-xs font-black uppercase text-white hover:bg-white hover:text-black"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => moderate(m, "rejected")}
                      className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default BrutalistAdminDashboard;
