# Sweep Shift release preparation

Target version: **1.0.0**. This project is the original cozy cleaning game: a complete campaign followed by optional replay and Endless Shift.

The publishing boundary for this task is an uploaded, reviewed **itch.io draft**. The owner makes the final choice to publish. Do not describe a draft or a local preview as publicly available.

## Game upload

Create the browser-game ZIP from the contents of `dist`, with `index.html` at the root of the archive. Include its JavaScript modules, stylesheet, and SVG icon. Do not include test fixtures, local saves, screenshots, documentation, `.git`, or development-server scripts inside the playable ZIP.

After packaging, extract that exact archive into an isolated directory and serve it over HTTP. Verify startup, room rendering, movement, pause, and reload/settings behavior. Compare every extracted and HTTP-served file against the tested source. Full completion and progression coverage comes from the physical campaign suite and the earned browser run documented in PLAYTEST.md. Record the archive's filename, byte size, and SHA-256 in the final release evidence.

Upload the ZIP as a browser-playable HTML game. Preview the actual uploaded game in the itch.io page before handing over the final publication action. Keep the page in Draft until that review is complete.

## Prepared page copy

**Title:** Sweep Shift

**Short description:** Glide, gather, and leave every room lovely. A cozy cleaning game with a tiny vacuum robot.

**Suggested category:** HTML game · Simulation · Singleplayer

**Suggested tags:** Cozy, Relaxing, Cleaning, Casual, 2D, Top-Down, Singleplayer

**Price:** Free

### Main description

**A little mess. A lovely clean.**

Meet your new favorite chore. Guide a tiny vacuum robot through colorful rooms, pull loose scraps into satisfying little swirls, and watch a lovely clean floor emerge underneath.

Empty your bag at a collection station, pocket the coins, and give your robot a small tune-up before its next shift. There's no rush: simply finishing a room opens the next one.

- Restore **24 rooms** across a workshop, an after-hours arcade, a greenhouse, and a rooftop party.
- Enjoy four kinds of mess: crumbs, fluttering confetti, dusty patches, and stubborn scraps.
- Buy **20 upgrade ranks** and collect **five cosmetic shells**.
- Find **24 optional keepsakes** for your treasure shelf.
- Chase faster medals when you feel like it, or take your time.
- Finish the campaign to unlock **Endless Shift**, with repeatable room seeds and your favorite robot upgrades.

### Controls

Move with **WASD or arrow keys**, or **hold the mouse button** to guide the robot. On a touchscreen, drag to steer. Suction happens automatically. Stay beside a collection station for a moment to empty your bag.

At **95% clean**, the room gets one final sweep—no searching for an invisible last crumb. **Escape** pauses. Sound, volume, and reduced motion are in Settings.

### Saves

Your career saves in the current browser. Clearing its site data clears the save. Progress does not transfer between browsers or between different hosting addresses. Room coins join your career balance only when the room is complete. Leaving an unfinished room discards all coins from that room, including material already emptied at a station. Previously completed rooms, purchases, medals, and treasures remain saved.

If saving is blocked, the game shows a warning and remains playable for that session.

### Credits

A game by **Nathan Norris**, developed with AI assistance for code, design iteration, writing, and testing. Game artwork is drawn using original Canvas and SVG code, and sound effects are synthesized with Web Audio. Screenshots show actual gameplay.

## Page presentation

Use the game's warm cream, deep teal, mint, coral, and yellow palette. Keep body copy readable and the cover recognizable at small sizes. The cover should show the mint robot, a visible boundary between messy and clean floor, a collection station, and the **Sweep Shift** title.

Use three to five genuine gameplay screenshots showing room variety and the finished interface. Label marketing artwork as cover art rather than presenting it as a gameplay screenshot. Complete the platform's AI-disclosure fields accurately for the AI-assisted code and writing; describe the actual artwork workflow used for any promotional assets.

## Release evidence

[PLAYTEST.md](PLAYTEST.md) is the source for completed validation, measured outcomes, and remaining limitations. Do not turn automated solver timings into a claim about how long a human campaign takes. Do not claim physical-phone or multiple-browser-engine testing unless those checks actually happened.

The reviewed playable archive is `artifacts/sweep-shift-itch.zip`: **37,697 bytes**, **8 files**, with `index.html` at its root. Its SHA-256 is:

```text
665a749ef35ee0d70bbdf06de6768c86b87ab08e7425deecd42b4c63a5959100
```

Every archive entry, extracted file, and HTTP-served file matched the corresponding tested `dist` file. The regenerated verification manifest is `tmp/package-manifest.json`.

The marketing assets are `marketing/cover.png` (1260 × 1000), plus the actual gameplay screenshots `marketing/02-arcade.png`, `marketing/03-greenhouse.png`, and `marketing/04-rooftop.png`.

The saved [itch.io draft](https://fooded.itch.io/sweep-shift) has project ID **5021059**. Its game ZIP is marked for browser play; the cover, three screenshots, and cream/teal page styling with a Sans Serif font and sidebar have been saved. The draft status was verified.

The actual uploaded game passed its browser smoke check inside itch.io: Run Game opened the title and room 1; ordinary mouse drags and keyboard movement collected 10 pieces (4% clean). Clicking outside the game paused it on loss of focus, and Resume continued the room. See PLAYTEST.md for the scope of this check and the full local campaign validation.

The game remains a draft. The public-publish action remains for the owner; a draft link may require the owner's signed-in account. The matching 1260 × 320 page banner has also been uploaded and its saved appearance verified after reload. Cover, banner, three gameplay screenshots, and the formatted description source are in marketing/.
