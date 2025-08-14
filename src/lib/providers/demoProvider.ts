import { Journey } from "@/types/journey";
import { JourneyProvider } from "./adapter";

const iso = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

function mkJourney(durationMin: number, transfers: number): Journey {
  return {
    durationMinutes: durationMin,
    transfers,
    legs: [
      {
        departure: iso(7, 45),
        arrival: iso(7, 45 + durationMin),
        origin: { id: "8002549", name: "Hamburg Hbf" },
        destination: { id: "8400058", name: "Amsterdam Centraal" },
        operator: transfers === 0 ? "ICE" : "IC/ICE",
        line: transfers === 0 ? "ICE 123" : "IC 200 → ICE 78",
      },
    ],
    bookingUrl:
      "https://www.bahn.com/en?from=Hamburg%20Hbf&to=Amsterdam%20Centraal",
  };
}

export const demoProvider: JourneyProvider = {
  async searchJourneys({ limit = 3 }) {
    const list = [
      mkJourney(340, 0), // 5h40
      mkJourney(305, 1), // 5h05
      mkJourney(370, 2), // 6h10
      mkJourney(330, 1), // 5h30
      mkJourney(390, 2), // 6h30
    ];
    return list.slice(0, limit);
  },
};
