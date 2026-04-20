import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collectionGroup, onSnapshot, QuerySnapshot, DocumentData, collection, addDoc, Timestamp, getDocs, query, where, deleteDoc, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { addReview, getMoverReviews } from "@/firebase/review";
import type { Review } from "@/types/review";
import { useRouter } from "next/router";

interface Mover {
  id: string;
  companyName: string;
  serviceArea: string;
  contactNumber: string;
  email: string;
  status: "available" | "unavailable";
  verificationStatus: "pending" | "approved" | "rejected";
  uid?: string;
}


const ClientDashboard: React.FC = () => {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showBooking, setShowBooking] = useState(false);
  const [selectedMover, setSelectedMover] = useState<Mover | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [reviewModal, setReviewModal] = useState<{ open: boolean; booking: any | null }>({ open: false, booking: null });
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [moverReviews, setMoverReviews] = useState<Record<string, Review[]>>({});
  const [quotes, setQuotes] = useState<any[]>([]);
  const [showQuotes, setShowQuotes] = useState(false);
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; bookingId: string | null; moverName: string }>({ 
    isOpen: false, 
    bookingId: null, 
    moverName: '' 
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const auth = typeof window !== "undefined" ? getAuth() : null;
  const user = auth?.currentUser;
  const router = useRouter();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!user) return;
    
    const adminEmails = ["admin@admin.com", "admin@moversconnect.com", "beastkee@example.com"];
    if (user.email && adminEmails.includes(user.email)) {
      router.replace("/admin-dashboard");
      return;
    }

    // Verify user is actually a client in the database
    const verifyClientAccess = async () => {
      try {
        const clientDoc = await getDoc(doc(db, "users", user.uid, "clients", user.uid));
        if (!clientDoc.exists()) {
          alert("Access denied. You are not registered as a client.");
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error verifying client access:", error);
      }
    };
    
    verifyClientAccess();
  }, [user, router]);

  // Fetch my bookings (as client) - Real-time
  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, "bookings"), where("clientId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      setMyBookings(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    }, (error: any) => {
      console.error("Error fetching bookings:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

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

  // Fetch quotes for this client (Real-time)
  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, "quotes"), where("clientId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      setQuotes(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    }, (error: any) => {
      console.error("Error fetching quotes:", error);
    });
    
    return () => unsubscribe();
  }, [user]);
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

  // Open message modal and fetch messages
  const openMessageModal = (bookingId: string, moverName: string) => {
    setMessageModal({ isOpen: true, bookingId, moverName });
    setMessages([]);
    setNewMessage('');
    
    // Set up real-time listener for messages
    const messagesRef = collection(db, 'bookings', bookingId, 'messages');
    const unsubscribe = onSnapshot(messagesRef, (snapshot: any) => {
      const msgs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      msgs.sort((a: any, b: any) => a.timestamp?.seconds - b.timestamp?.seconds);
      setMessages(msgs);
    });
    
    // Clean up listener when modal closes
    return unsubscribe;
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !messageModal.bookingId || !user) return;
    
    setSendingMessage(true);
    try {
      const messagesRef = collection(db, 'bookings', messageModal.bookingId, 'messages');
      await addDoc(messagesRef, {
        message: newMessage.trim(),
        sender: 'client',
        senderName: user.email?.split('@')[0] || 'Client',
        timestamp: Timestamp.now()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId: string, bookingStatus: string) => {
    // Only allow canceling pending bookings
    if (bookingStatus !== "pending") {
      alert("You can only cancel pending bookings. For accepted bookings, please contact the mover.");
      return;
    }

    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      alert("Booking canceled successfully!");
      // Real-time listener will automatically update the list
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  // My Bookings & Review Section
  const renderMyBookings = () => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black text-[#1f1b14]">My Bookings</h2>
        <span className="rounded-full border-2 border-[#1f1b14] bg-[#fff5da] px-4 py-2 text-sm font-bold text-[#1f1b14]">
          {myBookings.length} Total
        </span>
      </div>
      {myBookings.length === 0 ? (
        <div className="rounded-2xl border-2 border-[#1f1b14] bg-white/90 p-12 text-center shadow-[6px_6px_0_#1f1b14]">
          <p className="text-lg font-medium text-[#4c4438]">No bookings yet. Start by booking a mover below.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border-2 border-[#1f1b14] bg-white shadow-[8px_8px_0_#1f1b14]">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#fff0cf]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide text-[#5d3f1e]">Mover</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide text-[#5d3f1e]">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide text-[#5d3f1e]">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide text-[#5d3f1e]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide text-[#5d3f1e]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe4d0]">
                {myBookings.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-[#fffaf0]">
                    <td className="px-6 py-4 font-semibold text-[#1f1b14]">{b.moverName}</td>
                    <td className="px-6 py-4 text-[#4c4438]">{b.date}</td>
                    <td className="px-6 py-4 text-[#4c4438]">{b.time}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        b.status === "accepted" ? "bg-green-100 text-green-800" :
                        b.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border-2 border-[#1f1b14] bg-[#1f1b14] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#53d8ff] hover:text-[#1f1b14]"
                          onClick={() => openMessageModal(b.id, b.moverEmail || 'Mover')}
                        >
                          Message
                        </button>
                        {b.status === "pending" && (
                          <button
                            className="rounded-lg border-2 border-[#7f2a18] bg-[#ffe4db] px-4 py-2 text-sm font-bold text-[#7f2a18] transition hover:bg-[#ffcfbf]"
                            onClick={() => handleCancelBooking(b.id, b.status)}
                          >
                            Cancel
                          </button>
                        )}
                        {isBookingReviewable(b) && (
                          <button
                            className="rounded-lg border-2 border-[#5d3f1e] bg-[#fff0cf] px-4 py-2 text-sm font-bold text-[#5d3f1e] transition hover:bg-[#ffe0a8]"
                            onClick={() => setReviewModal({ open: true, booking: b })}
                          >
                            Review
                          </button>
                        )}
                      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border-2 border-[#1f1b14] bg-[#fff8ed] p-8 text-[#1f1b14] shadow-[10px_10px_0_#1f1b14]">
        <button
          className="absolute right-4 top-4 text-2xl font-bold text-[#6f6556] transition-colors hover:text-[#1f1b14]"
          onClick={() => setReviewModal({ open: false, booking: null })}
        >
          ×
        </button>
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#1f1b14] bg-[#fff0cf]">
            <span className="text-4xl">⭐</span>
          </div>
          <h2 className="text-2xl font-black">Review {reviewModal.booking.moverName}</h2>
          <p className="mt-2 text-[#4c4438]">Share your experience</p>
        </div>
        <form onSubmit={handleReviewSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-bold text-[#5d3f1e]">Rating</label>
            <select
              value={reviewRating}
              onChange={e => setReviewRating(Number(e.target.value))}
              className="w-full rounded-lg border-2 border-[#1f1b14] bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#53d8ff]/40"
              required
            >
              {[5, 4, 3, 2, 1].map(r => (
                <option key={r} value={r}>{"⭐".repeat(r)} {r} Star{r > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-bold text-[#5d3f1e]">Comment</label>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              className="w-full resize-none rounded-lg border-2 border-[#1f1b14] bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#53d8ff]/40"
              rows={4}
              placeholder="Share your thoughts about this mover..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg border-2 border-[#1f1b14] bg-[#1f1b14] py-3 font-bold text-white transition hover:bg-[#53d8ff] hover:text-[#1f1b14] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={reviewSubmitting}
          >
            {reviewSubmitting ? "Submitting..." : "Submit Review"}
          </button>
          {reviewSuccess && (
            <div className="rounded-lg border border-green-600/40 bg-green-100 p-3 text-center text-green-700">
              {reviewSuccess}
            </div>
          )}
          {reviewError && (
            <div className="rounded-lg border border-red-600/40 bg-red-100 p-3 text-center text-red-700">
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
      const movs: Mover[] = snapshot.docs
        .map((doc: any) => {
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
            status: data.status || "available",
            verificationStatus: data.verificationStatus || "pending",
          };
        })
        // Only show approved and available movers to clients
        .filter((mover: Mover) => 
          mover.verificationStatus === "approved" && 
          mover.status === "available"
        );
      
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
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMover) return;
    
    try {
      await addDoc(collection(db, "bookings"), {
        clientId: user.uid,
        clientEmail: user.email,
        moverId: selectedMover.uid, // Use the mover's user ID
        moverName: selectedMover.companyName,
        date: bookingDate,
        time: bookingTime,
        status: "pending",
        createdAt: Timestamp.now(),
      });
      alert("Booking successful! The mover will review your request.");
      setShowBooking(false);
      setBookingDate("");
      setBookingTime("");
      setSelectedMover(null);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
    }
  };

  // Open message modal and fetch messages

  const renderMovers = (status: Mover["status"]) => {
    const filteredMovers = movers.filter(
      (mover) =>
        mover.status === status &&
        (mover.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         mover.serviceArea?.toLowerCase().includes(searchQuery.toLowerCase()))
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
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{mover.companyName}</h3>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <span className="text-purple-400">📍</span>
                <strong>Service Area:</strong> {mover.serviceArea}
              </p>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <span className="text-purple-400">📞</span>
                <strong>Contact:</strong> {mover.contactNumber}
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
    <div className="min-h-screen bg-[#f5f0e5] text-[#1f1b14]">
      {/* Header Section */}
      <div className="border-b-2 border-[#1f1b14] bg-[#fff7ea] shadow-[0_4px_0_#1f1b14]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-black">Client Dashboard</h1>
              <p className="text-[#4c4438]">Welcome back. Find and book verified movers.</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-[#6f6556]">Logged in as</p>
                <p className="font-semibold text-[#1f1b14]">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Button */}
        <div className="mb-6">
          <button
            className="rounded-xl border-2 border-[#1f1b14] bg-[#1f1b14] px-6 py-3 font-bold text-white transition hover:bg-[#53d8ff] hover:text-[#1f1b14]"
            onClick={() => setShowQuotes((prev) => !prev)}
          >
            {showQuotes ? "Hide Quotes" : "View Received Quotes"} ({quotes.length})
          </button>
        </div>

        {/* Quotes Section */}
        {showQuotes && (
          <div className="mb-8 rounded-2xl border-2 border-[#1f1b14] bg-white p-6 shadow-[8px_8px_0_#1f1b14]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black">Received Quotes</h2>
              <span className="rounded-full border-2 border-[#1f1b14] bg-[#fff5da] px-4 py-2 text-sm font-bold">
                {quotes.length} Quotes
              </span>
            </div>
            
            {quotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="mb-2 text-lg text-[#4c4438]">No quotes received yet</p>
                <p className="text-sm text-[#6f6556]">Movers will send you quotes for your requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quotes.map((quote) => (
                  <div key={quote.id} className="rounded-xl border border-[#ded1bb] bg-[#fffaf1] p-5 transition-colors hover:bg-[#fff5e5]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#5d3f1e] bg-[#fff0cf]">
                          <span className="text-2xl">🚚</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{quote.moverName || 'Mover'}</p>
                          <p className="text-xs text-[#6f6556]">
                            {quote.createdAt ? new Date(quote.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#2d7d48]">${quote.amount}</p>
                        <p className="text-xs text-[#6f6556]">Quote Amount</p>
                      </div>
                    </div>
                    
                    {quote.notes && (
                      <div className="mb-4 rounded-lg bg-[#fff0cf] p-3">
                        <p className="text-sm text-[#4c4438]">
                          <span className="font-semibold text-[#5d3f1e]">Notes: </span>
                          {quote.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        className="flex-1 rounded-lg border-2 border-[#1f1b14] bg-[#1f1b14] px-4 py-2 font-bold text-white transition hover:bg-[#53d8ff] hover:text-[#1f1b14]"
                        onClick={() => {
                          alert('Quote accepted! Booking confirmed.');
                          // Here you would update the quote status in Firestore
                        }}
                      >
                        Accept Quote
                      </button>
                      <button
                        className="flex-1 rounded-lg border-2 border-[#7f2a18] bg-[#ffe4db] px-4 py-2 font-bold text-[#7f2a18] transition hover:bg-[#ffcfbf]"
                        onClick={() => {
                          alert('Quote declined.');
                          // Here you would update the quote status in Firestore
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
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
              placeholder="Search movers by name or service area"
              className="w-full rounded-xl border-2 border-[#1f1b14] bg-white px-6 py-4 text-[#1f1b14] placeholder-[#7c7264] shadow-[5px_5px_0_#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#53d8ff]/40"
            />
          </div>
        </div>

      {/* Booking Modal */}
      {showBooking && selectedMover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border-2 border-[#1f1b14] bg-[#fff8ed] p-8 text-[#1f1b14] shadow-[10px_10px_0_#1f1b14]">
            <button
              className="absolute right-4 top-4 text-2xl font-bold text-[#6f6556] transition-colors hover:text-[#1f1b14]"
              onClick={() => setShowBooking(false)}
            >
              ×
            </button>
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#1f1b14] bg-[#fff0cf]">
                <span className="text-4xl">📅</span>
              </div>
              <h2 className="text-2xl font-black">Book {selectedMover.companyName}</h2>
              <p className="mt-2 text-[#4c4438]">Schedule your moving service</p>
            </div>
            <form onSubmit={handleBooking} className="space-y-5">
              <div>
                <label className="mb-2 block font-bold text-[#5d3f1e]">Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  required
                  className="w-full rounded-lg border-2 border-[#1f1b14] bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#53d8ff]/40"
                />
              </div>
              <div>
                <label className="mb-2 block font-bold text-[#5d3f1e]">Time</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  required
                  className="w-full rounded-lg border-2 border-[#1f1b14] bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#53d8ff]/40"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg border-2 border-[#1f1b14] bg-[#1f1b14] py-3 font-bold text-white transition hover:bg-[#53d8ff] hover:text-[#1f1b14]"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

        {renderMyBookings()}
        {renderReviewModal()}

        {/* Available Movers Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black">Available Movers</h2>
            <span className="rounded-full border-2 border-[#1f1b14] bg-[#e7f7ed] px-4 py-2 text-sm font-bold text-[#1f1b14]">
              {movers.length} Available
            </span>
          </div>
          
          {movers.length === 0 ? (
            <div className="rounded-2xl border-2 border-[#1f1b14] bg-white p-12 text-center shadow-[6px_6px_0_#1f1b14]">
              <p className="text-lg text-[#4c4438]">No approved movers available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {movers
                .filter((mover) =>
                  searchQuery === "" ||
                  mover.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  mover.serviceArea?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((mover) => (
                  <div
                    key={mover.id}
                    className="rounded-xl border-2 border-[#1f1b14] bg-white p-6 shadow-[6px_6px_0_#1f1b14] transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1f1b14] bg-[#fff0cf]">
                        <span className="text-2xl">🚚</span>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                        Available
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-black text-[#1f1b14]">{mover.companyName}</h3>
                    <div className="space-y-2 mb-4">
                      <p className="flex items-center gap-2 text-sm text-[#4c4438]">
                        <span>📍</span>
                        <strong>Service Area:</strong> {mover.serviceArea}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-[#4c4438]">
                        <span>📞</span>
                        <strong>Contact:</strong> {mover.contactNumber}
                      </p>
                    </div>
                    <button
                      className="mt-4 w-full rounded-lg border-2 border-[#1f1b14] bg-[#1f1b14] px-4 py-3 font-bold text-white transition hover:bg-[#53d8ff] hover:text-[#1f1b14]"
                      onClick={() => handleBookClick(mover)}
                    >
                      Book This Mover
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      {/* Message Modal */}
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border-2 border-[#1f1b14] bg-[#fff8ed] shadow-[10px_10px_0_#1f1b14]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#1f1b14] p-6">
              <div>
                <h3 className="text-2xl font-black text-[#1f1b14]">Messages</h3>
                <p className="mt-1 text-sm text-[#5d5447]">
                  Chat with {messageModal.moverName}
                </p>
              </div>
              <button
                onClick={() => setMessageModal({ isOpen: false, bookingId: null, moverName: '' })}
                className="text-[#6f6556] transition-colors hover:text-[#1f1b14]"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="py-8 text-center text-[#5d5447]">
                  <p className="text-lg">No messages yet</p>
                  <p className="mt-2 text-sm">Start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        msg.sender === 'client'
                          ? 'border border-[#1f1b14] bg-[#1f1b14] text-white'
                          : 'border border-[#d9c8ac] bg-[#fff1d9] text-[#1f1b14]'
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1">
                        {msg.sender === 'client' ? 'You' : messageModal.moverName}
                      </p>
                      <p className="break-words">{msg.message}</p>
                      <p className="mt-2 text-xs opacity-70">
                        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t-2 border-[#1f1b14] p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !sendingMessage && newMessage.trim()) {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 rounded-xl border-2 border-[#1f1b14] bg-white px-4 py-3 text-[#1f1b14] focus:outline-none focus:ring-2 focus:ring-[#53d8ff]/40"
                  disabled={sendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="rounded-xl border-2 border-[#1f1b14] bg-[#1f1b14] px-6 py-3 font-bold text-white transition hover:bg-[#53d8ff] hover:text-[#1f1b14] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
