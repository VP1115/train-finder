# 🚄 Hamburg ⇄ Amsterdam Train Finder

A Next.js web application that allows users to search for train connections between Hamburg and Amsterdam, view outbound and return journeys, and compare travel details such as duration, transfers, and booking links. The app is optimized for both one-way and round-trip searches, with customizable options like date, nights, sorting preference, and number of results per leg.

## 🚀 Live Demo

[https://train-finder.vercel.app](https://train-finder.vercel.app) (Deployment link will be updated after deployment)

## 🎯 Features

- Search for **one-way** or **round-trip** journeys between Hamburg and Amsterdam
- Configurable:
  - Departure date
  - Return date or number of nights (for round trips)
  - Sort by fastest, fewest transfers, or earliest
  - Set limit for results per leg
- Displays:
  - Origin and destination
  - Duration
  - Number of transfers
  - Operator and train line (if available)
  - Direct booking link
  - Price information (when available)
- Responsive, clean UI using Tailwind CSS
- API integration with caching and error handling
- Mobile-friendly design

## 🛠 Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Backend API Route:** Next.js API endpoint using Deutsche Bahn transport API
- **Utilities:** Custom date utilities, type-safe models, caching mechanism

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd train-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open in browser:
   ```
   http://localhost:3000
   ```

## 🧪 Testing

Run the tests with:
```bash
npm test
```

## 🏗 Build & Lint

Run the following before submitting or deploying:
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
│   │   ├── favicon.ico    # Favicon
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.module.css # Home page styles
│   │   ├── page.tsx       # Home page component
│   ├── lib/              # Utility functions & providers
│   │   ├── date.ts        # Date utility functions
│   │   ├── providers/     # API providers
│   ├── types/            # TypeScript type definitions
├── __tests__/            # Unit tests
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── jest.config.js
├── jest.setup.ts
└── README.md
```

## 🌟 Application Demo

### Quick Start Guide

1. **Access the Application**
   Visit [https://train-finder.vercel.app](https://train-finder.vercel.app) (deployment link will be updated after deployment)

2. **Search for Journeys**
   - Select your trip type (one-way or round-trip)
   - Choose your departure date
   - If round-trip, specify the number of nights you want to stay
   - Select your preferred sorting option (fastest, fewest transfers, or earliest)
   - Click "Find Trains"

3. **View Results**
   - Results are displayed in an easy-to-read format with cards on mobile and tables on desktop
   - Each journey shows duration, number of transfers, departure/arrival times, and price
   - For round-trips, both outbound and return journeys are displayed
   - Click "Book Now" to go to the Deutsche Bahn booking page

### Key Features

- **One-Way Trip Search**: Quick search for single journeys
- **Round-Trip Search**: Plan your complete journey with return options
- **Multiple Sorting Options**: Sort by fastest, fewest transfers, or earliest departure
- **Responsive Design**: Works great on mobile, tablet, and desktop
- **Real-Time Data**: Uses Deutsche Bahn transport API for accurate information

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Deployment Steps

1. Create a GitHub repository for the project
2. Push the code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

3. Connect your GitHub repository to Vercel:
   - Go to [Vercel](https://vercel.com)
   - Sign up or log in
   - Click "New Project"
   - Import your GitHub repository
   - Follow the deployment wizard

4. Update the deployment URL in README.md

The application will be live at your-project-name.vercel.app

## 📝 Notes

- This project was built with a strong focus on clean, type-safe code and modular architecture.
- The provider logic is abstracted to easily allow swapping train data sources or adding caching/rate-limit handling.
- Caching is implemented for both journey data and price data to improve performance.
- The UI is designed to be responsive and works well on both desktop and mobile devices.
