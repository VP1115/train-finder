# Train Finder – Smart Train Journey Search

**Author:** Vardaan Peshawaria  

## Overview
Train Finder is a Next.js-based application that helps users quickly find and compare train journeys between selected stations. It provides outbound and return journey details in a clean and intuitive interface, allowing users to filter and sort results according to their preferences.

## Features
- **One-way or roundtrip** search support.
- Date selection with either return date or number of nights.
- Sort results by fastest, fewest transfers, or earliest departure.
- Configurable results per leg.
- Responsive UI with Tailwind CSS styling.
- Fully typed using TypeScript for safety and maintainability.

## Tech Stack
- **Next.js 15** with App Router
- **React 19**
- **Tailwind CSS** for responsive styling
- **TypeScript** for type safety
- API integration with a transport provider to fetch train data.

## How It Works
1. User selects trip type, dates, and sorting options.
2. Application sends a request to the `/api/search` endpoint.
3. Server fetches journey data from the configured transport API.
4. Results are displayed in an easy-to-read table with outbound and return journeys.

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
git clone <repo-url>
cd train-finder
npm install
```

### Development
```bash
npm run dev
```
App will be available at [http://localhost:3000](http://localhost:3000).

### Build & Run Production
```bash
npm run build
npm start
```

### Lint & Type Check
```bash
npm run lint
npx tsc --noEmit
```

## Deployment
This app can be deployed easily on **Vercel** or any Node.js server.

## Future Improvements
- Integrate live pricing data from Trainline or Navitia.
- Add caching for API responses to reduce load and improve reliability.
- Enhance UI with seat availability and carbon emission estimates.
- Handle API rate limits gracefully.

