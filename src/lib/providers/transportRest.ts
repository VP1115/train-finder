import { Journey } from "@/types/journey";
import { JourneyProvider } from "./adapter";

/** Slim types from transport.rest */
type TRStopRef = { id: string; name: string };
type TRLine = { name?: string; productName?: string };
type TROperator = { name?: string };

type TRLeg = {
  departure: string;
  arrival: string;
  origin: TRStopRef;
  destination: TRStopRef;
  line?: TRLine;
  operator?: TROperator;
};

type TRPrice = { amount?: number; currency?: string };
type TRTicket = { price?: TRPrice };

type TRJourney = {
  legs?: TRLeg[];
  transfers?: number;
  duration?: string | number; // ISO-8601 "PT5H30M" or seconds
  tickets?: TRTicket[];
};

/** -------- helpers -------- */
function parseISODurationToMinutes(d?: string | number): number {
  if (d == null) return 0;
  if (typeof d === "number") return Math.round(d / 60); // seconds -> minutes
  if (!d.startsWith("PT")) return 0;
  let minutes = 0;
  const h = d.match(/(\d+)H/);
  const m = d.match(/(\d+)M/);
  if (h) minutes += parseInt(h[1], 10) * 60;
  if (m) minutes += parseInt(m[1], 10);
  return minutes;
}
function minutesBetween(aISO?: string, bISO?: string) {
  if (!aISO || !bISO) return 0;
  const a = Date.parse(aISO);
  const b = Date.parse(bISO);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 60000));
}
function pickCheapestCentsCurrency(tickets?: TRTicket[]) {
  if (!Array.isArray(tickets) || tickets.length === 0)
    return { priceCents: undefined as number | undefined, currency: undefined as string | undefined };
  const candidates = tickets
    .map((t) => t?.price)
    .filter((p): p is TRPrice => !!p && typeof p.amount === "number");
  if (candidates.length === 0) return { priceCents: undefined, currency: undefined };
  const cheapest = candidates.sort((a, b) => (a.amount! - b.amount!))[0];
  // <1000 → major units (EUR), otherwise already minor units
  const amt = cheapest.amount!;
  const priceCents = amt < 1000 ? Math.round(amt * 100) : Math.round(amt);
  const currency = cheapest.currency || "EUR";
  return { priceCents, currency };
}

/** -------- simple in-memory cache with TTL (per runtime) -------- */
type CacheVal = { priceCents?: number; currency?: string; ts: number };
const PRICE_CACHE = new Map<string, CacheVal>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function cacheGet(key: string): CacheVal | undefined {
  const v = PRICE_CACHE.get(key);
  if (!v) return undefined;
  if (Date.now() - v.ts > TTL_MS) {
    PRICE_CACHE.delete(key);
    return undefined;
  }
  return v;
}
function cacheSet(key: string, priceCents?: number, currency?: string) {
  PRICE_CACHE.set(key, { priceCents, currency, ts: Date.now() });
}

/** -------- provider -------- */
export const transportRestProvider: JourneyProvider = {
  async searchJourneys({ originId, destinationId, date, limit = 5, sort = "fastest" }) {
    // Use a normal morning time so we get daytime services
    const departure = `${date}T08:00`;

    // 1) Fetch journeys
    const url = new URL("https://v6.db.transport.rest/journeys");
    url.searchParams.set("from", originId);
    url.searchParams.set("to", destinationId);
    url.searchParams.set("departure", departure);
    url.searchParams.set("results", String(Math.min(12, Math.max(3, limit * 3)))); // fetch extra, then filter
    url.searchParams.set("stopovers", "false");
    url.searchParams.set("tickets", "true"); // try to get fares with journeys
    url.searchParams.set("language", "en");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`Transport REST error: ${res.status}`);

    const data = (await res.json()) as { journeys?: TRJourney[] };
    const raw = (data.journeys ?? []).filter((j) => Array.isArray(j.legs) && j.legs!.length > 0);

    // 2) Map base journeys (without /prices fallback yet)
    let mapped = raw.map<Journey & { priceCents?: number; currency?: string }>((j) => {
      const legs = (j.legs ?? []).map((l) => ({
        departure: l.departure,
        arrival: l.arrival,
        origin: { id: l.origin?.id ?? "", name: l.origin?.name ?? "" },
        destination: { id: l.destination?.id ?? "", name: l.destination?.name ?? "" },
        operator: l.operator?.name ?? l.line?.productName ?? undefined,
        line: l.line?.name,
      }));
      const first = legs[0];
      const last = legs[legs.length - 1];

      const durationISO = parseISODurationToMinutes(j.duration);
      const durationFallback = minutesBetween(first?.departure, last?.arrival);
      const durationMinutes = durationISO || durationFallback;

      const transfers = typeof j.transfers === "number" ? j.transfers : Math.max(0, legs.length - 1);

      const bookingUrl =
        first && last
          ? `https://www.bahn.com/en?from=${encodeURIComponent(first.origin.name)}&to=${encodeURIComponent(
              last.destination.name
            )}&date=${encodeURIComponent(date)}`
          : undefined;

      const { priceCents, currency } = pickCheapestCentsCurrency(j.tickets);

      return { durationMinutes, transfers, legs, bookingUrl, priceCents, currency };
    });

    // 3) If none of the journeys have price, try /prices (single call) and apply the lowest returned
    const anyPrice = mapped.some((m) => typeof m.priceCents === "number");
    if (!anyPrice) {
      const cacheKey = `${originId}-${destinationId}-${date}`;
      const cached = cacheGet(cacheKey);
      let fallbackPrice: CacheVal | undefined = cached;

      if (!fallbackPrice) {
        const pUrl = new URL("https://v6.db.transport.rest/prices");
        pUrl.searchParams.set("from", originId);
        pUrl.searchParams.set("to", destinationId);
        pUrl.searchParams.set("date", date);
        pUrl.searchParams.set("language", "en");

        try {
          const pRes = await fetch(pUrl.toString(), { cache: "no-store" });
          if (pRes.ok) {
            const pJson = (await pRes.json()) as {
              tickets?: { price?: number; amount?: number; currency?: string }[];
              /** some deployments return min/max instead of tickets */
              min?: number; max?: number; currency?: string;
            };

            let cents: number | undefined;
            let curr: string | undefined;

            if (Array.isArray(pJson.tickets) && pJson.tickets.length) {
              // pick lowest price
              const lowest = [...pJson.tickets]
                .map((t) => (typeof t.price === "number" ? t.price : t.amount))
                .filter((n): n is number => typeof n === "number")
                .sort((a, b) => a - b)[0];
              if (typeof lowest === "number") {
                cents = lowest < 1000 ? Math.round(lowest * 100) : Math.round(lowest);
              }
              curr = pJson.tickets[0]?.currency || pJson.currency || "EUR";
            } else if (typeof pJson.min === "number") {
              cents = pJson.min < 1000 ? Math.round(pJson.min * 100) : Math.round(pJson.min);
              curr = pJson.currency || "EUR";
            }

            fallbackPrice = { priceCents: cents, currency: curr, ts: Date.now() };
            cacheSet(cacheKey, cents, curr);
          }
        } catch {
          // ignore pricing fallback errors; we’ll keep N/A
        }
      }

      if (fallbackPrice?.priceCents) {
        mapped = mapped.map((m) =>
          typeof m.priceCents === "number" ? m : { ...m, priceCents: fallbackPrice!.priceCents, currency: fallbackPrice!.currency }
        );
      }
    }

    // 4) Sort & cap
    const sorted = [...mapped].sort((a, b) => {
      if (sort === "fewest-transfers") return a.transfers - b.transfers || a.durationMinutes - b.durationMinutes;
      if (sort === "earliest") {
        const ad = a.legs[0]?.departure ?? "";
        const bd = b.legs[0]?.departure ?? "";
        return ad.localeCompare(bd);
      }
      return a.durationMinutes - b.durationMinutes; // fastest
    });

    return sorted.slice(0, Math.min(limit, 8));
  },
};
