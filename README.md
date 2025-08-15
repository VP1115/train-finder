# 🚄 Hamburg ⇄ Amsterdam Train Finder

A Next.js web application that lets you search for train connections between **Hamburg** and **Amsterdam**, compare travel options, and book directly — all in a clean, responsive interface.

## 📘 Background & Motivation

Imagine this:  
Our team is exploring the idea of a satellite office in Amsterdam to better serve clients in the Netherlands and tap into the Dutch tech ecosystem. At the same time, many of us love short weekend city trips, and Amsterdam is just a few hours away by train from Hamburg.

Whether it’s a **business trip** with a single overnight stay or a **leisure trip** with a few nights in between, travel planning often means comparing:

- 💶 Cheapest option  
- 🕒 Fastest route  
- 🛏️ Number of overnight stays  
- 🧭 Departure/arrival times each day  

Rather than relying on slow, bloated booking websites, this app is designed to be **lean**, **fast**, and **purpose-built** for Hamburg ⇄ Amsterdam trips.

## 🎯 Features

- **Trip type:** One-way or round-trip  
- **Customizable search:**
  - Departure date
  - Return date **OR** number of nights (for round trips)
  - Sort by fastest, fewest transfers, or earliest departure
  - Limit results per leg (3–5)
- **Detailed results:**
  - Origin and destination
  - Departure and arrival times
  - Duration
  - Number of transfers
  - Price (when available)
  - Direct booking link
- **Responsive design:** Works on desktop and mobile
- **Error handling:** Clear messages for failed searches

## 🚀 Live Demo

[**View Live App**](https://train-finder.vercel.app)

## 🛠 Tech Stack

- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Inline CSS with React style objects
- **Language:** TypeScript
- **Backend API Route:** Next.js API endpoint (connectable to providers like Deutsche Bahn API)

## 📦 Installation

Clone the repository:
```bash
git clone <repo-url>
cd train-finder
```

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npm run dev
```

Open in your browser:  
[http://localhost:3000](http://localhost:3000)

## 🏗 Build & Lint

Before deploying, make sure the build passes and the code is type-safe:
```bash
npm run build
npm run lint
npx tsc --noEmit
```

## 📁 Project Structure

```
train-finder/
├── public/               # Static assets
├── src/
│   ├── app/              # Pages, layout, global styles
│   │   ├── api/search    # API route for journey search
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Main search page
│   ├── types/            # TypeScript type definitions
│   ├── lib/              # Utility functions
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

## 🌟 How to Use

1. Select **Trip Type** (One-way or Round-trip).
2. Choose your **Departure Date**.
3. For round trips, either:
   - Set a **Return Date**, or
   - Specify **Number of Nights**.
4. Choose **Sort Preference** (Fastest / Fewest Transfers / Earliest).
5. Set **Options per Leg** (3–5 recommended).
6. Click **Search**.
7. View results for outbound and (if applicable) return trips.
8. Click **Book** to open the external booking page.

## 🚀 Deployment (Vercel)

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com), sign in, and click **New Project**.
3. Import your repository.
4. Follow the deployment steps.
5. Replace the live link in this README.

## 📝 Notes

- The app is currently hardcoded for **Hamburg Hbf → Amsterdam Centraal**.
- `/api/search` can be adapted to any data provider.
- Inline styles are used for simplicity — you can easily migrate to Tailwind or CSS Modules later.
- Fully type-safe — no `any` usage.

## 📌 Future Improvements

- Multi-city trip support
- More train data sources
- Price history tracking
- Favorite routes and saved searches
