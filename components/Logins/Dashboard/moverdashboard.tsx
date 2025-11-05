import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collectionGroup, onSnapshot, doc, getDoc, collection, query, where, updateDoc, addDoc, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMoverReviews } from "@/firebase/review";
import type { Review } from "@/types/review";
import { useRouter } from "next/router";

interface ClientRequest {
  id: string;
  name: string;
  address: string;
  contact: string;
  description: string;
  date: string;
  clientId?: string; // Add optional clientId field
}

const MoverDashboard: React.FC = () => {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [showCreds, setShowCreds] = useState(false);
  const [credentials, setCredentials] = useState<string[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [showBookings, setShowBookings] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<"all" | "pending" | "accepted" | "declined">("all");
  const [interestedRequests, setInterestedRequests] = useState<Set<string>>(new Set());
  const [quoteModal, setQuoteModal] = useState<{ open: boolean; request: ClientRequest | null }>({ open: false, request: null });
  const [quoteAmount, setQuoteAmount] = useState<string>("");
  const [quoteNotes, setQuoteNotes] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; bookingId: string | null; clientName: string }>({ 
    isOpen: false, 
    bookingId: null, 
    clientName: '' 
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const auth = typeof window !== "undefined" ? getAuth() : null;
  const user = auth?.currentUser;
  const router = useRouter();

  // Fetch bookings for this mover
  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, "bookings"), where("moverId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      setBookings(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    }, (error: any) => {
      console.error("Error fetching bookings:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Fetch client requests
  useEffect(() => {
    const unsubscribe = onSnapshot(collectionGroup(db, "clients"), (snapshot: any) => {
      const reqs: ClientRequest[] = snapshot.docs.map((doc: any) => {
        // Extract clientId from the document path (e.g., users/{clientId}/clients/{docId})
        const pathParts = doc.ref.path.split('/');
        const clientId = pathParts[1]; // Get the user ID from the path
        
        return {
          id: doc.id,
          clientId, // Add the extracted clientId
          ...doc.data()
        };
      });
      setRequests(reqs);
    }, (error: any) => {
      console.error("Error fetching client requests:", error);
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch reviews for this mover
  useEffect(() => {
    if (!user) return;
    
    const fetchReviews = async () => {
      const moverReviews = await getMoverReviews(user.uid);
      setReviews(moverReviews);
      
      // Calculate average rating
      if (moverReviews.length > 0) {
        const avg = moverReviews.reduce((sum, review) => sum + review.rating, 0) / moverReviews.length;
        setAverageRating(Math.round(avg * 10) / 10); // Round to 1 decimal
      }
    };
    
    fetchReviews();
  }, [user]);

  // Fetch availability status
  useEffect(() => {
    if (!user) return;
    
    const fetchAvailability = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "movers", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsAvailable(data.isAvailable !== false); // Default to true if not set
          // Also fetch credentials here
          setCredentials(data.credentials || []);
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    };
    
    fetchAvailability();
  }, [user]);

  // Toggle availability
  const toggleAvailability = async () => {
    if (!user || availabilityLoading) return;
    
    setAvailabilityLoading(true);
    try {
      const docRef = doc(db, "users", user.uid, "movers", user.uid);
      await updateDoc(docRef, {
        isAvailable: !isAvailable,
        lastUpdated: Timestamp.now(),
      });
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Failed to update availability. Please try again.");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredRequests = requests.filter((request) =>
    request.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter bookings by status
  const filteredBookings = bookingFilter === "all" 
    ? bookings 
    : bookings.filter(b => b.status === bookingFilter);

  // Count pending bookings
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  // Handle express interest
  const handleExpressInterest = (requestId: string) => {
    setInterestedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  // Handle quote submission
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteModal.request || !user) return;
    
    // Check verification status
    if (verificationStatus !== "approved") {
      alert("You must be verified by an admin before sending quotes.");
      return;
    }
    
    if (!quoteModal.request.clientId) {
      alert("Cannot send quote: Client information not available.");
      return;
    }
    
    try {
      // Save quote to Firestore
      await addDoc(collection(db, "quotes"), {
        requestId: quoteModal.request.id,
        clientId: quoteModal.request.clientId, // Use the extracted clientId
        moverId: user.uid,
        moverName: user.email?.split('@')[0] || "Mover",
        moverEmail: user.email,
        amount: parseFloat(quoteAmount),
        notes: quoteNotes,
        status: "pending",
        createdAt: Timestamp.now(),
      });
      
      // Reset and close
      setQuoteModal({ open: false, request: null });
      setQuoteAmount("");
      setQuoteNotes("");
      alert("Quote sent successfully!");
    } catch (error) {
      console.error("Error sending quote:", error);
      alert("Failed to send quote. Please try again.");
    }
  };

  // Handle opening message modal
  const openMessageModal = (bookingId: string, clientName: string) => {
    setMessageModal({ isOpen: true, bookingId, clientName });
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

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !messageModal.bookingId || !user) return;
    
    setSendingMessage(true);
    try {
      const messagesRef = collection(db, 'bookings', messageModal.bookingId, 'messages');
      await addDoc(messagesRef, {
        message: newMessage.trim(),
        sender: 'mover',
        senderName: user.email?.split('@')[0] || 'Mover',
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

  // Fetch mover credentials from Firestore
  const fetchCredentials = async () => {
    if (!user) return;
    setLoadingCreds(true);
    try {
      const docRef = doc(db, "users", user.uid, "movers", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCredentials(data.credentials || []);
        setVerificationStatus(data.verificationStatus || "pending");
        setIsAvailable(data.isAvailable !== undefined ? data.isAvailable : true);
      } else {
        setCredentials([]);
        setVerificationStatus("pending");
      }
    } catch {
      setCredentials([]);
      setVerificationStatus("pending");
    } finally {
      setLoadingCreds(false);
    }
  };

  // Fetch verification status on mount
  useEffect(() => {
    fetchCredentials();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Verification Status Banner */}
      {verificationStatus !== "approved" && (
        <div className={`${
          verificationStatus === "pending" 
            ? "bg-gradient-to-r from-yellow-600 to-orange-600" 
            : "bg-gradient-to-r from-red-600 to-rose-600"
        } py-4 px-6 text-center shadow-lg`}>
          <p className="text-white font-semibold text-lg">
            {verificationStatus === "pending" && (
              <>⏳ Your account is pending admin verification. You can browse but cannot send quotes or receive bookings yet.</>
            )}
            {verificationStatus === "rejected" && (
              <>❌ Your account verification was rejected. Please contact support for more information.</>
            )}
          </p>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-800/50 to-blue-800/50 backdrop-blur-sm border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Mover Dashboard</h1>
              <p className="text-blue-200">Manage your bookings and view client requests</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {/* Availability Toggle */}
              <button
                onClick={toggleAvailability}
                disabled={availabilityLoading}
                className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all ${
                  isAvailable
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                } ${availabilityLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{isAvailable ? "🟢" : "🔴"}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold">
                      {isAvailable ? "Available" : "Unavailable"}
                    </p>
                    <p className="text-xs opacity-80">Click to toggle</p>
                  </div>
                </div>
              </button>

              {/* Rating Display */}
              {reviews.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl font-bold text-yellow-400">{averageRating}</span>
                    <span className="text-2xl">⭐</span>
                  </div>
                  <p className="text-xs text-gray-300">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
              )}
              <div className="text-right">
                <p className="text-sm text-blue-200">Logged in as</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Credentials Section - Always Visible */}
        <div className="mb-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">📄 My Credentials</h2>
            <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">
              {credentials.length} File{credentials.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {credentials.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-lg">
              <p className="text-gray-400 text-lg mb-2">📋 No credentials uploaded yet</p>
              <p className="text-gray-500 text-sm mb-4">Upload your professional documents during registration or profile update</p>
              <p className="text-xs text-gray-600">Examples: License, Insurance, Certifications</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {credentials.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-blue-500/50 transition-all flex items-center gap-3 group"
                >
                  <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold group-hover:text-blue-300 transition-colors">
                      Credential {idx + 1}
                    </p>
                    <p className="text-xs text-gray-400">Click to view/download</p>
                  </div>
                  <span className="text-blue-400 text-xl">→</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Availability Toggle */}
        <div className="md:hidden mb-6">
          <button
            onClick={toggleAvailability}
            disabled={availabilityLoading}
            className={`w-full px-6 py-4 rounded-xl font-semibold shadow-lg transition-all ${
              isAvailable
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
            } ${availabilityLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{isAvailable ? "🟢" : "🔴"}</span>
              <div>
                <p className="text-lg font-bold">
                  {isAvailable ? "You're Available" : "You're Unavailable"}
                </p>
                <p className="text-sm opacity-90">Tap to toggle status</p>
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all relative"
            onClick={() => setShowBookings((prev) => !prev)}
          >
            📋 {showBookings ? "Hide My Bookings" : "Show My Bookings"} ({bookings.length})
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            onClick={() => setShowReviews((prev) => !prev)}
          >
            ⭐ {showReviews ? "Hide Reviews" : "Show Reviews"} ({reviews.length})
          </button>
        </div>
        {showBookings && (
          <div className="mb-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-semibold">
                {bookings.length} Total
              </span>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setBookingFilter("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  bookingFilter === "all"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setBookingFilter("pending")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  bookingFilter === "pending"
                    ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                Pending ({bookings.filter(b => b.status === "pending").length})
              </button>
              <button
                onClick={() => setBookingFilter("accepted")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  bookingFilter === "accepted"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                Accepted ({bookings.filter(b => b.status === "accepted").length})
              </button>
              <button
                onClick={() => setBookingFilter("declined")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  bookingFilter === "declined"
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                Declined ({bookings.filter(b => b.status === "declined").length})
              </button>
            </div>

            {filteredBookings.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No bookings in this category.</p>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((b, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{b.clientEmail}</p>
                        <p className="text-sm text-gray-400">
                          📅 {b.date} • ⏰ {b.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          b.status === "accepted" ? "bg-green-500/20 text-green-300" :
                          b.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                          "bg-red-500/20 text-red-300"
                        }`}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                        <button
                          onClick={() => openMessageModal(b.id, b.clientEmail)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg"
                        >
                          💬 Message
                        </button>
                        {b.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg"
                              onClick={async () => {
                                await updateDoc(doc(db, "bookings", b.id), { status: "accepted" });
                              }}
                            >✓ Accept</button>
                            <button
                              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg"
                              onClick={async () => {
                                await updateDoc(doc(db, "bookings", b.id), { status: "declined" });
                              }}
                            >✗ Decline</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        {showReviews && (
          <div className="mb-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">My Reviews & Ratings</h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-3xl font-bold text-yellow-400">{averageRating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-2xl ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-600'}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-400 ml-2">({reviews.length} reviews)</span>
                  </div>
                )}
              </div>
            </div>
            
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-2">No reviews yet</p>
                <p className="text-gray-500 text-sm">Complete bookings to receive reviews from clients</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-yellow-500/20 w-10 h-10 rounded-full flex items-center justify-center">
                          <span className="text-xl">👤</span>
                        </div>
                        <div>
                          <p className="font-semibold">Client Review</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                                ⭐
                              </span>
                            ))}
                            <span className="text-sm text-gray-400 ml-1">({review.rating}/5)</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-gray-300 mt-2 pl-12">{review.comment}</p>
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
              placeholder="🔍 Search client requests by name..."
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none backdrop-blur-sm shadow-lg"
            />
          </div>
        </div>

        {/* Client Requests Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">📬 Client Requests</h2>
            <span className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold">
              {filteredRequests.length} Requests
            </span>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No client requests available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 hover:border-indigo-500/50 transform transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-indigo-500/20 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                    New
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{request.name}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-indigo-400">📍</span>
                    <span><strong>Address:</strong> {request.address}</span>
                  </p>
                  <p className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-indigo-400">📞</span>
                    <span><strong>Contact:</strong> {request.contact}</span>
                  </p>
                  <p className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-indigo-400">📝</span>
                    <span><strong>Description:</strong> {request.description}</span>
                  </p>
                  <p className="text-sm text-indigo-300 flex items-center gap-2">
                    <span>📅</span>
                    <span><strong>Date:</strong> {new Date(request.date).toLocaleDateString()}</span>
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleExpressInterest(request.id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all shadow-lg ${
                      interestedRequests.has(request.id)
                        ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                        : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                    }`}
                  >
                    {interestedRequests.has(request.id) ? "⭐ Interested" : "👋 Express Interest"}
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-lg ${
                      verificationStatus === "approved"
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white cursor-pointer"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                    title={verificationStatus === "approved" ? "Send Quote" : "Verification required to send quotes"}
                    onClick={() => {
                      if (verificationStatus === "approved") {
                        setQuoteModal({ open: true, request });
                      } else {
                        alert("You must be verified by an admin before sending quotes.");
                      }
                    }}
                    disabled={verificationStatus !== "approved"}
                  >
                    💰
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quote Modal */}
        {quoteModal.open && quoteModal.request && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 text-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors"
                onClick={() => setQuoteModal({ open: false, request: null })}
              >
                ×
              </button>
              <div className="text-center mb-6">
                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💰</span>
                </div>
                <h2 className="text-2xl font-bold">Send Quote</h2>
                <p className="text-gray-400 mt-2">To: {quoteModal.request.name}</p>
              </div>
              <form onSubmit={handleQuoteSubmit} className="space-y-5">
                <div>
                  <label className="block font-semibold mb-2 text-green-300">💵 Quote Amount</label>
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={e => setQuoteAmount(e.target.value)}
                    placeholder="Enter amount (e.g., 5000)"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-green-300">📝 Additional Notes</label>
                  <textarea
                    value={quoteNotes}
                    onChange={e => setQuoteNotes(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                    rows={4}
                    placeholder="Include details about services, timeline, or special offers..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  ✓ Send Quote
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Message Modal */}
        {messageModal.isOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[80vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    💬 Messages
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Chat with {messageModal.clientName}
                  </p>
                </div>
                <button
                  onClick={() => setMessageModal({ isOpen: false, bookingId: null, clientName: '' })}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm mt-2">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'mover' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-4 ${
                          msg.sender === 'mover'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        <p className="text-sm font-semibold mb-1">
                          {msg.sender === 'mover' ? 'You' : messageModal.clientName}
                        </p>
                        <p className="break-words">{msg.message}</p>
                        <p className="text-xs mt-2 opacity-70">
                          {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-700">
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
                    className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoverDashboard;
