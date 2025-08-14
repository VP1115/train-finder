export type Station = { id: string; name: string };

export type Leg = {
  departure: string; // ISO
  arrival: string;   // ISO
  origin: Station;
  destination: Station;
  operator?: string;
  line?: string; // e.g., ICE/IC number
};

export type Journey = {
  durationMinutes: number;
  transfers: number;
  legs: Leg[];
  bookingUrl?: string;
  priceCents?: number;
  currency?: string;
};

export type SearchParams = {
  originId: string;
  destinationId: string;
  date: string;          // YYYY-MM-DD
  isRoundTrip: boolean;
  returnDate?: string;   // YYYY-MM-DD
  nights?: number;
  limit?: number;        // default 3
  sort?: "fastest" | "fewest-transfers" | "earliest";
};

export type SearchResponse = {
  outBound: Journey[];
  inBound?: Journey[];
};
