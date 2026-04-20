import { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { brutal, BrutalistLinkButton, BrutalistShell } from "@/components/brutalist/ui";

type MoverRow = {
  id: string;
  companyName: string;
  serviceArea: string;
  contactNumber: string;
  email: string;
  status: "available" | "unavailable";
  verificationStatus: "pending" | "approved" | "rejected";
};

const BrutalistClientDashboard = () => {
  const [movers, setMovers] = useState<MoverRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const loadMovers = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collectionGroup(db, "movers"));
        const data = snapshot.docs.map((doc: any) => {
          const value = doc.data() as Partial<MoverRow>;
          return {
            id: doc.id,
            companyName: value.companyName || "Unnamed mover",
            serviceArea: value.serviceArea || "N/A",
            contactNumber: value.contactNumber || "N/A",
            email: value.email || "N/A",
            status: value.status || "available",
            verificationStatus: value.verificationStatus || "pending",
          } as MoverRow;
        });
        setMovers(data.filter((m: MoverRow) => m.verificationStatus === "approved"));
      } finally {
        setLoading(false);
      }
    };

    loadMovers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return movers;
    return movers.filter(
      (m) =>
        m.companyName.toLowerCase().includes(q) ||
        m.serviceArea.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [movers, query]);

  return (
    <BrutalistShell
      headerClassName="bg-[#ffe55a]"
      eyebrow="Client Console / Brutalist Preview"
      title="Find Verified Movers"
    >
        <div className="border-b-4 border-black bg-[#ffe55a] px-5 pb-5">
          <div className="flex flex-wrap gap-3">
            <BrutalistLinkButton href="/client-dashboard">Open Classic Dashboard</BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist">Back to Preview Hub</BrutalistLinkButton>
          </div>
        </div>

        <section className="border-b-4 border-black bg-white p-5">
          <label htmlFor="search" className="block text-xs font-black uppercase tracking-wide">
            Search Company / Area / Email
          </label>
          <input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Nairobi, Atlas Movers"
            className="mt-2 w-full border-4 border-black bg-[#fefcf7] px-3 py-3 text-sm font-semibold outline-none focus:bg-[#fff7cd]"
          />
        </section>

        <main className="grid gap-0 md:grid-cols-2">
          {loading ? (
            <div className="col-span-full border-b-4 border-black bg-white p-8 text-sm font-bold uppercase">Loading verified movers...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full border-b-4 border-black bg-white p-8 text-sm font-bold uppercase">No movers matched this search.</div>
          ) : (
            filtered.map((m) => (
              <article key={m.id} className="border-b-4 border-r-0 border-black bg-white p-5 odd:bg-[#f8f7f2] md:border-r-4 md:nth-[2n]:border-r-0">
                <h2 className="text-2xl font-black uppercase leading-tight">{m.companyName}</h2>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide">{m.serviceArea}</p>
                <div className="mt-4 space-y-1 text-sm font-semibold">
                  <p>Email: {m.email}</p>
                  <p>Phone: {m.contactNumber}</p>
                  <p>Status: {m.status.toUpperCase()}</p>
                </div>
                <button className="mt-5 border-4 border-black bg-black px-3 py-2 text-xs font-black uppercase text-white transition hover:bg-white hover:text-black">
                  Request Quote (Preview)
                </button>
              </article>
            ))
          )}
        </main>
    </BrutalistShell>
  );
};

export default BrutalistClientDashboard;
