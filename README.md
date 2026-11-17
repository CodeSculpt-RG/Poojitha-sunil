# Poojitha & Sunil — Wedding Invitation

A responsive Next.js wedding invitation for Poojitha and Sunil, built as a continuous storytelling page with their supplied photographs, film, pet artwork, full celebration schedule, venue search, calendar downloads, countdown, and sharing.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm run typecheck
npm run build
```

## Content

Authoritative invitation facts live in `src/data/invitation.ts`. The main experience is composed in `src/components/InvitationExperience.tsx`, with styling in `src/app/globals.css`.

The opening invitation is presented as a focused first screen. Page scrolling is enabled only after the guest selects View Invitation, which uses a restrained cinematic fade into the story rather than a decorative door or panel effect.

All event times are displayed as India Standard Time (`Asia/Kolkata`). Calendar downloads use the same dates and timings as the visible schedule. Events without supplied durations intentionally export with a start time only rather than inventing an end time.
