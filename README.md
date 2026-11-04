# Ledger: Sponsorship CRM for student orgs

React + Vite front-end prototype for tracking companies, contacts, sponsorship requests,
follow-ups, money raised, and officer handoffs. Uses in-memory sample data (no backend yet).

## Setup
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # outputs to dist/

## Deploy to GitHub Pages
Build, then publish the `dist/` folder (e.g. with the `gh-pages` package or a GitHub Action).

## Structure
- `src/App.jsx`: all views (Home, Dashboard, Pipeline, Companies, Profile, Handoff) and seed data
- `src/styles.css`: design tokens (light/dark) and layout
- `src/main.jsx`: entry point

## Not built yet
Real auth, database, email reminders, CSV import/export, and server-side AI calls.
AI buttons currently use local templates; LLM calls must run on a server so API keys never reach the browser.
