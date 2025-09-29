
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
      <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
      {myBookings.length === 0 ? (
        <p className="text-gray-400">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/10 text-white rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2">Mover</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Review</th>
              </tr>
            </thead>
            <tbody>
              {myBookings.map((b) => (
                <tr key={b.id} className="border-b border-white/20">
                  <td className="px-4 py-2">{b.moverName}</td>
                  <td className="px-4 py-2">{b.date}</td>
                  <td className="px-4 py-2">{b.time}</td>
                  <td className="px-4 py-2 capitalize">{b.status}</td>
                  <td className="px-4 py-2">
                    {isBookingReviewable(b) ? (
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
                        onClick={() => setReviewModal({ open: true, booking: b })}
                      >
                        Leave Review
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">{b.status === "accepted" ? "Reviewed" : "-"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
  // Review Modal
  const renderReviewModal = () => reviewModal.open && reviewModal.booking ? (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-8 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={() => setReviewModal({ open: false, booking: null })}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Review {reviewModal.booking.moverName}</h2>
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Rating</label>
            <select
              value={reviewRating}
              onChange={e => setReviewRating(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              required
            >
              {[5,4,3,2,1].map(r => (
                <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Comment</label>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded font-semibold"
            disabled={reviewSubmitting}
          >
            {reviewSubmitting ? "Submitting..." : "Submit Review"}
          </button>
          {reviewSuccess && <div className="text-green-600 mt-2">{reviewSuccess}</div>}
          {reviewError && <div className="text-red-600 mt-2">{reviewError}</div>}
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
      return <p className="text-gray-400">No movers in this category.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovers.map((mover) => (
          <div
            key={mover.id}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-5 shadow-lg hover:scale-105 transform transition-all duration-300"
          >
            <h3 className="text-xl font-bold text-white">{mover.name}</h3>
            <p className="text-sm text-gray-300">
              <strong>Contact:</strong> {mover.contact}
            </p>
            <p
              className={`text-sm mt-2 ${
                status === "available"
                  ? "text-green-400"
                  : status === "accepted"
                  ? "text-blue-400"
                  : "text-red-400"
              }`}
            >
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
            {status === "available" && (
              <button
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                onClick={() => handleBookClick(mover)}
              >
                Book This Mover
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-6">
      <h1 className="text-4xl font-extrabold text-center mb-10">Client Dashboard</h1>

      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search movers by name..."
          className="w-full sm:w-1/2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      {/* Booking Modal */}
      {showBooking && selectedMover && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowBooking(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Book {selectedMover.name}</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block font-medium">Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium">Time</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
              >
                Confirm Booking
              </button>
            </form>
            {bookingStatus && <div className="mt-2 text-center text-green-600">{bookingStatus}</div>}
          </div>
        </div>
      )}

      {renderMyBookings()}
      {renderReviewModal()}

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Available Movers</h2>
        {renderMovers("available")}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Movers Who Accepted Requests</h2>
        {renderMovers("accepted")}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Movers Who Declined Requests</h2>
        {renderMovers("declined")}
      </section>
    </div>
  );
};

export default ClientDashboard;
