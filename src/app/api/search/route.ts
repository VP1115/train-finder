import { NextRequest, NextResponse } from "next/server";
import { SearchParams, SearchResponse } from "@/types/journey";
import { addDays } from "@/lib/date";
import { transportRestProvider as provider } from "@/lib/providers/transportRest";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SearchParams;

  const {
    originId,
    destinationId,
    date,
    isRoundTrip,
    nights,
    returnDate,
    limit = 3,
    sort = "fastest",
  } = body;

  if (!originId || !destinationId || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const computedReturn =
    !returnDate && nights != null ? addDays(date, nights) : returnDate;

  const outBound = await provider.searchJourneys({
    originId,
    destinationId,
    date,
    limit,
    sort,
  });

  let inBound = undefined;
  if (isRoundTrip && computedReturn) {
    inBound = await provider.searchJourneys({
      originId: destinationId,
      destinationId: originId,
      date: computedReturn,
      limit,
      sort,
    });
  }

  const res: SearchResponse = { outBound, inBound };
  return NextResponse.json(res);
}
