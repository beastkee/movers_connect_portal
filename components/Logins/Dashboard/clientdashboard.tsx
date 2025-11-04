
import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collectionGroup, onSnapshot, QuerySnapshot, DocumentData, collection, addDoc, Timestamp, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { addReview, getMoverReviews } from "@/firebase/review";
import type { Review } from "@/types/review";

interface Mover {
  id: string;
  name: string;
  contact: string;
  status: "available" | "accepted" | "declined";
}


const ClientDashboard: React.FC = () => {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showBooking, setShowBooking] = useState(false);
  const [selectedMover, setSelectedMover] = useState<Mover | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [reviewModal, setReviewModal] = useState<{ open: boolean; booking: any | null }>({ open: false, booking: null });
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [moverReviews, setMoverReviews] = useState<Record<string, Review[]>>({});
  const auth = typeof window !== "undefined" ? getAuth() : null;
  const user = auth?.currentUser;
  // Fetch my bookings (as client)
  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const q = query(collection(db, "bookings"), where("clientId", "==", user.uid));
      const snap = await getDocs(q);
      setMyBookings(snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    };
    fetchBookings();
  }, [user, bookingStatus]);

  // Fetch reviews for movers in my bookings
  useEffect(() => {
    const fetchReviews = async () => {
      const moverIds = Array.from(new Set(myBookings.map(b => b.moverId)));
      const reviewsObj: Record<string, Review[]> = {};
      for (const moverId of moverIds) {
        reviewsObj[moverId] = await getMoverReviews(moverId);
      }
      setMoverReviews(reviewsObj);
    };
    if (myBookings.length > 0) fetchReviews();
  }, [myBookings]);
  // Review submission handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal.booking || !user) return;
    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);
    try {
      await addReview({
        bookingId: reviewModal.booking.id,
        moverId: reviewModal.booking.moverId,
        clientId: user.uid,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess("Review submitted!");
      setReviewModal({ open: false, booking: null });
      setReviewRating(5);
      setReviewComment("");
    } catch (err: any) {
      setReviewError("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };
  // Helper: check if a booking is reviewable (accepted & not already reviewed)
  const isBookingReviewable = (booking: any) => {
    if (booking.status !== "accepted") return false;
    const reviews = moverReviews[booking.moverId] || [];
    return !reviews.some(r => r.bookingId === booking.id && r.clientId === booking.clientId);
  };
  // My Bookings & Review Section
  const renderMyBookings = () => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">📋 My Bookings</h2>
        <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-semibold">
          {myBookings.length} Total
        </span>
      </div>
      {myBookings.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No bookings yet. Start by booking a mover below!</p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Mover</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {myBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{b.moverName}</td>
                    <td className="px-6 py-4 text-gray-300">{b.date}</td>
                    <td className="px-6 py-4 text-gray-300">{b.time}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        b.status === "accepted" ? "bg-green-500/20 text-green-300" :
                        b.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                        "bg-red-500/20 text-red-300"
                      }`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isBookingReviewable(b) ? (
                        <button
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                          onClick={() => setReviewModal({ open: true, booking: b })}
                        >
                          Leave Review
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">{b.status === "accepted" ? "✓ Reviewed" : "-"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
  // Review Modal
  const renderReviewModal = () => reviewModal.open && reviewModal.booking ? (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 text-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors"
          onClick={() => setReviewModal({ open: false, booking: null })}
        >
          ×
        </button>
        <div className="text-center mb-6">
          <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⭐</span>
          </div>
          <h2 className="text-2xl font-bold">Review {reviewModal.booking.moverName}</h2>
          <p className="text-gray-400 mt-2">Share your experience</p>
        </div>
        <form onSubmit={handleReviewSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-2 text-purple-300">⭐ Rating</label>
            <select
              value={reviewRating}
              onChange={e => setReviewRating(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            >
              {[5,4,3,2,1].map(r => (
                <option key={r} value={r} className="bg-gray-900">{"⭐".repeat(r)} {r} Star{r > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2 text-purple-300">💬 Comment</label>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
              rows={4}
              placeholder="Share your thoughts about this mover..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={reviewSubmitting}
          >
            {reviewSubmitting ? "Submitting..." : "✓ Submit Review"}
          </button>
          {reviewSuccess && (
            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center text-green-300">
              {reviewSuccess}
            </div>
          )}
          {reviewError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-center text-red-300">
              {reviewError}
            </div>
          )}
        </form>
      </div>
    </div>
  ) : null;

  useEffect(() => {
    // Listen for all movers in nested subcollections using collectionGroup
    const unsub = onSnapshot(collectionGroup(db, "movers"), (snapshot: any) => {
      const movs: Mover[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
      setMovers(movs);
    });
    return () => unsub();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleBookClick = (mover: Mover) => {
    setSelectedMover(mover);
    setShowBooking(true);
    setBookingStatus(null);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMover) return;
    setBookingStatus(null);
    try {
      await addDoc(collection(db, "bookings"), {
        clientId: user.uid,
        clientEmail: user.email,
        moverId: selectedMover.id,
        moverName: selectedMover.name,
        date: bookingDate,
        time: bookingTime,
        status: "pending",
        createdAt: Timestamp.now(),
      });
      setBookingStatus("Booking successful!");
      setShowBooking(false);
      setBookingDate("");
      setBookingTime("");
      setSelectedMover(null);
    } catch {
      setBookingStatus("Booking failed. Please try again.");
    }
  };

  const renderMovers = (status: Mover["status"]) => {
    const filteredMovers = movers.filter(
      (mover) =>
        mover.status === status &&
        mover.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredMovers.length === 0) {
      return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No movers in this category.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovers.map((mover) => (
          <div
            key={mover.id}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 hover:border-purple-500/50 transform transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  status === "available"
                    ? "bg-green-500/20 text-green-300"
                    : status === "accepted"
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{mover.name}</h3>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <span className="text-purple-400">📞</span>
                <strong>Contact:</strong> {mover.contact}
              </p>
            </div>
            {status === "available" && (
              <button
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                onClick={() => handleBookClick(mover)}
              >
                📅 Book This Mover
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-800/50 to-indigo-800/50 backdrop-blur-sm border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Client Dashboard</h1>
              <p className="text-purple-200">Welcome back! Find and book professional movers</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-purple-200">Logged in as</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="🔍 Search movers by name..."
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none backdrop-blur-sm shadow-lg"
            />
          </div>
        </div>

      {/* Booking Modal */}
      {showBooking && selectedMover && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 text-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors"
              onClick={() => setShowBooking(false)}
            >
              ×
            </button>
            <div className="text-center mb-6">
              <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📅</span>
              </div>
              <h2 className="text-2xl font-bold">Book {selectedMover.name}</h2>
              <p className="text-gray-400 mt-2">Schedule your moving service</p>
            </div>
            <form onSubmit={handleBooking} className="space-y-5">
              <div>
                <label className="block font-semibold mb-2 text-purple-300">📆 Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-purple-300">⏰ Time</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                ✓ Confirm Booking
              </button>
            </form>
            {bookingStatus && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center text-green-300">
                {bookingStatus}
              </div>
            )}
          </div>
        </div>
      )}

        {renderMyBookings()}
        {renderReviewModal()}

        {/* Available Movers Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">✨ Available Movers</h2>
            <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-semibold">
              {movers.filter(m => m.status === "available").length} Available
            </span>
          </div>
          {renderMovers("available")}
        </section>

        {/* Accepted Movers Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">✅ Accepted Requests</h2>
            <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">
              {movers.filter(m => m.status === "accepted").length} Accepted
            </span>
          </div>
          {renderMovers("accepted")}
        </section>

        {/* Declined Movers Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">❌ Declined Requests</h2>
            <span className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm font-semibold">
              {movers.filter(m => m.status === "declined").length} Declined
            </span>
          </div>
          {renderMovers("declined")}
        </section>
      </div>
    </div>
  );
};

export default ClientDashboard;
