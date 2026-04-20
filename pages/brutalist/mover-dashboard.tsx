import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/firebaseConfig";

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
    <div className="min-h-screen bg-[#f4f0e5] text-black">
      <div className="mx-auto max-w-6xl border-x-4 border-black">
        <header className="border-b-4 border-black bg-[#ff6d3d] p-5 text-black">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">Mover Console / Brutalist Preview</p>
          <h1 className="mt-1 text-4xl font-black uppercase">Operations Board</h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/mover-dashboard" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">
              Open Classic Dashboard
            </Link>
            <Link href="/brutalist" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">
              Back to Preview Hub
            </Link>
          </div>
        </header>

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
      </div>
    </div>
  );
};

export default BrutalistMoverDashboard;
