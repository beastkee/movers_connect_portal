// Firestore review type
type Review = {
  id?: string;
  bookingId: string;
  moverId: string;
  clientId: string;
  rating: number;
  comment: string;
  createdAt: any;
};

export type { Review };