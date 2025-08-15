"use client";

import { useState } from "react";
import type { SearchParams, SearchResponse, Journey } from "@/types/journey";

const HH = { id: "8002549", name: "Hamburg Hbf" };
const AMS = { id: "8400058", name: "Amsterdam Centraal" };

function prettyDuration(minutes: number) {
  if (!minutes || minutes < 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function hm(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dmy(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function formatPrice(priceCents?: number, currency?: string) {
  if (priceCents == null) return "N/A";
  const price = priceCents / 100;
  return `${currency || "€"}${price.toFixed(2)}`;
}

export default function Page() {
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState<string>("");
  const [nights, setNights] = useState<number>(1);
  const [sort, setSort] = useState<"fastest" | "fewest-transfers" | "earliest">("fastest");
  const [limit, setLimit] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    const body: SearchParams = {
      originId: HH.id,
      destinationId: AMS.id,
      date,
      isRoundTrip,
      limit,
      sort,
      ...(returnDate ? { returnDate } : {}),
      ...(!returnDate && isRoundTrip ? { nights } : {}),
    };

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json: SearchResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function JourneyTable({ title, journeys }: { title: string; journeys: Journey[] }) {
    return (
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#00f5d4" }}>
          {title}
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#14213d",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: "#00f5d4" }}>
              <th style={th}>From → To</th>
              <th style={th}>Departure</th>
              <th style={th}>Arrival</th>
              <th style={th}>Duration</th>
              <th style={th}>Transfers</th>
              <th style={th}>Price</th>
              <th style={th}>Link</th>
            </tr>
          </thead>
          <tbody>
            {journeys.map((j: Journey, i: number) => {
              const first = j.legs[0];
              const last = j.legs[j.legs.length - 1];
              return (
                <tr key={i} style={{ background: i % 2 ? "#1b2a49" : "#223355" }}>
                  <td style={td}>
                    {first?.origin.name} → {last?.destination.name}
                  </td>
                  <td style={td}>
                    {dmy(first.departure)}{" "}
                    <span style={{ color: "#f77f00" }}>{hm(first.departure)}</span>
                  </td>
                  <td style={td}>
                    {dmy(last.arrival)}{" "}
                    <span style={{ color: "#f77f00" }}>{hm(last.arrival)}</span>
                  </td>
                  <td style={td}>{prettyDuration(j.durationMinutes)}</td>
                  <td style={td}>{j.transfers}</td>
                  <td style={td}>{formatPrice(j.priceCents, j.currency)}</td>
                  <td style={td}>
                    {j.bookingUrl && (
                      <a
                        href={j.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#ff006e", fontWeight: "bold" }}
                      >
                        Book
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    );
  }

  return (
    <main
      style={{
        maxWidth: 950,
        margin: "0 auto",
        padding: 24,
        backgroundColor: "#0a0f1c",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#00f5d4" }}>
          Hamburg ⇄ Amsterdam: Smart Train Finder
        </h1>
        <p style={{ opacity: 0.9, marginTop: 6, color: "#caffbf" }}>
          One-way or roundtrip. Pick a date and optionally nights; see {limit} options per leg.
        </p>
      </header>

      <form onSubmit={onSubmit} style={formCard}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <span style={{ opacity: 0.9, fontSize: 14 }}>Trip:</span>
          <button type="button" onClick={() => setIsRoundTrip(false)} style={pill(!isRoundTrip)}>
            One-way
          </button>
          <button type="button" onClick={() => setIsRoundTrip(true)} style={pill(isRoundTrip)}>
            Roundtrip
          </button>
        </div>

        <div style={grid3}>
          <label style={label}>
            <span>Departure date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={input}
            />
          </label>

          {isRoundTrip && (
            <>
              <label style={label}>
                <span>Return date (optional)</span>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  style={input}
                />
              </label>

              <label style={label}>
                <span>Or nights</span>
                <input
                  type="number"
                  min={0}
                  value={nights}
                  onChange={(e) =>
                    setNights(parseInt(e.target.value || "0", 10))
                  }
                  style={input}
                />
              </label>
            </>
          )}
        </div>

        <div style={grid3}>
          <label style={label}>
            <span>Sort</span>
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as "fastest" | "fewest-transfers" | "earliest")
              }
              style={input}
            >
              <option value="fastest">Fastest</option>
              <option value="fewest-transfers">Fewest transfers</option>
              <option value="earliest">Earliest</option>
            </select>
          </label>

          <label style={label}>
            <span>Options per leg</span>
            <input
              type="number"
              min={1}
              max={5}
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value || "3", 10))}
              style={input}
            />
          </label>

          <div style={{ alignSelf: "end" }}>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div style={{ color: "#ff4d6d", marginTop: 12, fontSize: 14 }}>{error}</div>
      )}

      {data && (
        <>
          <JourneyTable title="Outbound" journeys={data.outBound} />
          {data.inBound && <JourneyTable title="Return" journeys={data.inBound} />}
        </>
      )}
    </main>
  );
}

const formCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "2px solid #00f5d4",
  borderRadius: 16,
  padding: 16,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
};

const label: React.CSSProperties = { display: "block", fontSize: 14, color: "#caffbf" };

const input: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #00f5d4",
  background: "#1b2a49",
  color: "#fff",
  outline: "none",
};

const submitBtn: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "#ff006e",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const pill = (active: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 999,
  border: `1px solid ${active ? "#ff006e" : "#00f5d4"}`,
  background: active ? "#ff006e" : "#00f5d4",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
});

const th: React.CSSProperties = { textAlign: "left", padding: 8, color: "#000" };

const td: React.CSSProperties = { padding: 8, color: "#fff" };
