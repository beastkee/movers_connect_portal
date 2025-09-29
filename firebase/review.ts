import { db } from "@/firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import type { Review } from "../types/review";

// Add a review for a completed booking
export async function addReview({ bookingId, moverId, clientId, rating, comment }: Omit<Review, "id" | "createdAt">) {
  return await addDoc(collection(db, "reviews"), {
    bookingId,
    moverId,
    clientId,
    rating,
    comment,
    createdAt: Timestamp.now(),
  });
}

// Get all reviews for a mover

export async function getMoverReviews(moverId: string): Promise<Review[]> {
  const q = query(collection(db, "reviews"), where("moverId", "==", moverId));
  const snap = await getDocs(q);
  return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Review[];
}

// Get all reviews by a client
export async function getClientReviews(clientId: string): Promise<Review[]> {
  const q = query(collection(db, "reviews"), where("clientId", "==", clientId));
  const snap = await getDocs(q);
  return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Review[];
}
