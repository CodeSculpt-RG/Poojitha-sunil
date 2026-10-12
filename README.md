# Sunil & Pooja — Wedding Invitation

A mobile-first Next.js wedding invitation for the celebrations on 11–13 December 2026.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For a production check, run `npm run build`; the static export is written to `out/`.

## Personal media mapping

The supplied personal media is copied non-destructively into `public/media/` and mapped in `src/data/invitation.ts`:

- `couple-portrait-01.jpeg`: black-and-white walking portrait from the supplied ZIP
- `couple-portrait-02.jpeg`: waterfall portrait from the supplied ZIP
- `couple-film-1.mp4` through `couple-film-4.mp4`: all four supplied couple clips
- `couple-film-*-poster.jpg`: posters generated from the corresponding actual clips
- `max-mummble.jpeg`: the supplied combined dog artwork with its original white edge and blue-and-white flowers
- `temple-facade.jpg`: compressed delivery asset for the generated stationary South Indian temple surround (`.png` preserved as the original)
- `temple-doors.jpg`: compressed delivery asset for the generated carved double-door artwork (`.png` preserved as the original); each leaf is independently animated in code
- `backgroundAudio`: intentionally remains `null`; no separate licensed/background track was supplied, so sound stays disabled rather than borrowing video audio

All factual content, schedule entries, venue, timezone, pet names, and asset paths live in the typed `src/data/invitation.ts` configuration. Per-event venue overrides are supported via each event’s optional `venue` field.

## Behavior notes

- The temple entrance appears once per browser session and can always be replayed.
- Skip and reduced-motion modes reveal the invitation immediately.
- Calendar buttons create timezone-aware ICS files in `Asia/Kolkata`.
- The map link performs a Google Maps search for the exact supplied venue name; it does not assume coordinates.
- Film video is only inserted after the guest presses play, keeping the four MP4 files out of the opening load path.
- The celebration carousel never auto-advances and preserves vertical touch scrolling; the full schedule remains visible beneath it.

## Generated artwork prompts

The two entrance assets were created with the built-in image-generation tool. The façade prompt requested a front-facing, portrait South Indian temple wedding surround with turquoise, cobalt, coral, violet, green and antique-gold architectural detail, an empty recessed central doorway, pillars, crown, threshold, garlands, banana leaves, brass lamps, lotus flowers and ceremonial pots, with no text or people. The door prompt requested a symmetrical rosewood double door with recessed lotus panels, wood grain, brass studs and matching ring handles, isolated without architecture or lettering.
