import { Journey } from "@/types/journey";

export interface JourneyProvider {
  searchJourneys(params: {
    originId: string;
    destinationId: string;
    date: string;     // YYYY-MM-DD
    limit?: number;
    sort?: "fastest" | "fewest-transfers" | "earliest";
  }): Promise<Journey[]>;
}
