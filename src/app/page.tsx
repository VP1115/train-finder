"use client";

import { useState } from "react";
import type { SearchParams, SearchResponse, Journey } from "@/types/journey";

const HH = { id: "8002549", name: "Hamburg Hbf" };
const AMS = { id: "8400058", name: "Amsterdam Centraal" };

type SortKey = "fastest" | "fewest-transfers" | "earliest";



export default function Page() {
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [nights, setNights] = useState<number>(1);
  const [returnDate, setReturnDate] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("fastest");
  const [limit, setLimit] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      if (!res.ok) throw new Error(await res.text());
      const json: SearchResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-3 py-1 rounded-full text-sm transition border border-white/10 ${
          active ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
        }`}
      >
        {children}
      </button>
    );
  }

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <label className="block text-sm">
        <span className="opacity-80">{label}</span>
        <div className="mt-1">{children}</div>
      </label>
    );
  }

  function InputBase(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <input
        {...props}
        className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
      />
    );
  }

  function SelectBase(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
      <select
        {...props}
        className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
      />
    );
  }

  function JourneyCard({ j }: { j: Journey }) {
    const first = j.legs[0];
    const last = j.legs[j.legs.length - 1];

    return (
      <div className="bg-[var(--card)] rounded-2xl p-4 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm opacity-80">
            {first?.origin.name} → {last?.destination.name}
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-white/10">
            {j.transfers} transfer{j.transfers === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-4">
          <div className="text-3xl font-extrabold">
            {Math.floor(j.durationMinutes / 60)}h {j.durationMinutes % 60}m
          </div>
          <div className="opacity-80">
            {first?.operator} {first?.line ? `• ${first.line}` : ""}
          </div>
        </div>
        {j.bookingUrl && (
          <a
            className="inline-block mt-3 text-sm underline hover:no-underline"
            href={j.bookingUrl}
            target="_blank"
            rel="noreferrer"
          >
            Book on DB
          </a>
        )}
      </div>
    );
  }

  function JourneyList({ title, journeys }: { title: string; journeys: Journey[] }) {
    return (
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <div className="grid gap-3">
          {journeys.map((j, i) => (
            <JourneyCard j={j} key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Hamburg ⇄ Amsterdam: Smart Train Finder</h1>
        <p className="opacity-80 text-sm mt-1">
          One-way or roundtrip. Pick a date and optionally nights; see 3–5 options per leg.
        </p>
      </header>

      <form onSubmit={onSubmit} className="bg-[var(--card)]/60 rounded-2xl p-5 border border-white/10 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm opacity-80">Trip:</span>
          <Pill active={!isRoundTrip} onClick={() => setIsRoundTrip(false)}>One-way</Pill>
          <Pill active={isRoundTrip} onClick={() => setIsRoundTrip(true)}>Roundtrip</Pill>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Departure date">
            <InputBase type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>

          {isRoundTrip && (
            <>
              <Field label="Return date (optional)">
                <InputBase type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </Field>
              <Field label="Or nights">
                <InputBase
                  type="number"
                  min={0}
                  value={Number.isFinite(nights) ? nights : 0}
                  onChange={(e) => setNights(parseInt(e.target.value || "0", 10))}
                />
              </Field>
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Sort">
            <SelectBase value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="fastest">Fastest</option>
              <option value="fewest-transfers">Fewest transfers</option>
              <option value="earliest">Earliest</option>
            </SelectBase>
          </Field>

          <Field label="Options per leg">
            <InputBase
              type="number"
              min={1}
              max={5}
              value={Number.isFinite(limit) ? limit : 3}
              onChange={(e) => setLimit(parseInt(e.target.value || "3", 10))}
            />
          </Field>

          <div className="sm:self-end">
            <button
              type="submit"
              className="w-full rounded-xl px-4 py-2 bg-white/20 hover:bg-white/30 transition border border-white/10"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="mt-4 text-red-300 text-sm">{error}</div>}

      {data && (
        <>
          <JourneyList title="Outbound" journeys={data.outBound} />
          {data.inBound && <JourneyList title="Return" journeys={data.inBound} />}
        </>
      )}
    </main>
  );
}
