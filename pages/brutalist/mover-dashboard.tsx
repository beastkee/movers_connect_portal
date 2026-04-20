import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/firebaseConfig";
import { BrutalistLinkButton, BrutalistShell } from "@/components/brutalist/ui";

type Booking = {
  id: string;
  status?: string;
  date?: string;
  time?: string;
};

const BrutalistMoverDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "bookings"), where("moverId", "==", user.uid));
        const snapshot = await getDocs(q);
        setBookings(
          snapshot.docs.map((d: any) => {
            const payload = d.data() as Booking;
            return {
              ...payload,
              id: d.id,
            };
          })
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const counts = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter((b) => b.status === "accepted").length,
      declined: bookings.filter((b) => b.status === "declined").length,
    };
  }, [bookings]);

  return (
    <BrutalistShell
      headerClassName="bg-[repeating-linear-gradient(135deg,#ff2fb3_0_16px,#000_16px_20px,#ffe600_20px_36px,#000_36px_40px,#00d2ff_40px_56px,#000_56px_60px)]"
      eyebrow="Mover Console / Brutalist Preview"
      title="Operations Board"
    >
        <div className="border-b-4 border-black bg-[#ff6d3d] px-5 pb-5">
          <div className="flex flex-wrap gap-3">
            <BrutalistLinkButton href="/mover-dashboard">Open Classic Dashboard</BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist">Back to Preview Hub</BrutalistLinkButton>
          </div>
        </div>

        <section className="grid gap-0 border-b-4 border-black md:grid-cols-4">
          <div className="border-r-0 border-black bg-white p-4 md:border-r-4">
            <p className="text-xs font-black uppercase">Total</p>
            <p className="text-3xl font-black">{counts.total}</p>
          </div>
          <div className="border-r-0 border-black bg-[#fff3d6] p-4 md:border-r-4">
            <p className="text-xs font-black uppercase">Pending</p>
            <p className="text-3xl font-black">{counts.pending}</p>
          </div>
          <div className="border-r-0 border-black bg-[#defbe6] p-4 md:border-r-4">
            <p className="text-xs font-black uppercase">Accepted</p>
            <p className="text-3xl font-black">{counts.accepted}</p>
          </div>
          <div className="bg-[#ffe2e0] p-4">
            <p className="text-xs font-black uppercase">Declined</p>
            <p className="text-3xl font-black">{counts.declined}</p>
          </div>
        </section>

        <main>
          {loading ? (
            <div className="border-b-4 border-black bg-white p-8 text-sm font-bold uppercase">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="border-b-4 border-black bg-white p-8 text-sm font-bold uppercase">No bookings yet.</div>
          ) : (
            bookings.map((b) => (
              <article key={b.id} className="border-b-4 border-black bg-white p-5 odd:bg-[#faf7ef]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide">Booking ID</p>
                    <p className="text-lg font-black">{b.id}</p>
                  </div>
                  <div className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase">
                    {String(b.status || "pending")}
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold">Schedule: {b.date || "N/A"} {b.time || ""}</p>
              </article>
            ))
          )}
        </main>
    </BrutalistShell>
  );
};

export default BrutalistMoverDashboard;
