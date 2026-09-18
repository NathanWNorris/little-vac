# Sweep Shift

**Clean rooms. Upgrade your vacuum.**

Version **1.2.0** replaces the pastel interface with a charcoal-and-amber game menu. The home screen has one Play/Continue action, Rooms, Upgrades, and How to play. Compact room rows show Play, Replay, or Locked; the upgrade store keeps numeric effects and prices clear. See the [redesign checks](docs/REDESIGN-1.2.0.md), [previous gameplay audit](docs/AUDIT-1.1.2.md), and historical [playtest results](PLAYTEST.md).

Sweep Shift is a browser game about a vacuum robot cleaning messy rooms. Collect debris, dock to empty the bag, and spend earned coins on upgrades.

The campaign has 24 authored rooms across a workshop, an after-hours arcade, a greenhouse, and a rooftop party. Finish the campaign to unlock Endless Shift: reproducible generated rooms that can be revisited using a seed.

## Play

- Move with **WASD or the arrow keys**, or **move your mouse over the room** and the robot follows it. No click or hold is needed; leaving the play area stops mouse steering.
- On a touchscreen, **drag to steer** with the movement joystick.
- Suction is automatic. Park beside a **collection station** to empty the bag automatically.
- A full bag stops suction, but the robot can still move normally.
- Optional keepsakes go to their own collection shelf, even when the dirt bag is full.
- Clean **95%** of a room to trigger its finishing sweep. The remaining scraps and everything in the bag are paid automatically.
- Press **Escape** or use **Pause** for a break. Sound and reduced motion are available in Settings.
- Choose **Pause → How to play** to reopen the controls and rules in any room.

There are no lives or mandatory time limits. Bronze rewards finishing; optional silver and gold medals reward faster routes. The timer and target times are tucked into Room details.

## Progression

Four upgrade categories each have five purchasable ranks: cleaning width, bag capacity, movement speed, and pull strength. Every location completed unlocks another cosmetic shell, for five shells in total. Each campaign room also contains one optional trinket for the collection shelf.

Use **Rooms** to see your next room, browse location previews, or replay a completed room. Use **Upgrades** to compare your current robot with the next rank, see what you can afford, and change its color. Purchases use saved career coins. Upgrades unlock only after finishing a room or using **Pause → Quit room & upgrade** and confirming. Pausing or browsing rooms alone does not unlock purchases. Quitting discards only the unfinished room’s cleaning and coins.

Completing a room unlocks the next one regardless of medal, trinket, or upgrade choices. Replays pay their cleaning coins again; completion bonuses, medal improvements, and trinket bonuses are awarded only when newly earned.

Coins, completed rooms, medals, best times, upgrades, shells, trinkets, and settings save in this browser. A room's coins enter your career balance only after completion. Browsing in-game menus pauses the active room; discarding the room, closing the page, or reloading loses its unfinished cleaning and coins, including material already emptied at a station. Clearing browser data also clears the career. If browser storage fails, a visible warning explains that the current career remains only in memory for that tab's session.

## Run locally

The game itself has no external runtime dependencies. A recent Node.js installation is needed only for the local server and verification scripts; no package installation is required.

```sh
node scripts/serve.mjs
```

Open `http://127.0.0.1:4180/`. The server binds to the local computer. Serve the files over HTTP rather than opening `index.html` directly, because the source uses JavaScript modules.

```sh
node scripts/check.mjs
node scripts/verify.mjs
node scripts/verify.mjs --deep
node scripts/verify-builds.mjs
```

The syntax check automatically includes every JavaScript module in `dist`. The default suite checks 1,000 generated layouts, progression, input, save transactions, and real movement/suction through the full earned campaign. `--deep` also completes all 24 rooms without upgrades, completes 40 additional endless rooms, and runs 86,400 random-movement frames. The optional `verify-builds.mjs` checks 144 campaign runs across six upgrade builds and nine Endless seed inputs at production's 120 Hz timestep. Individual suites are `scripts/verify-progression.mjs`, `scripts/verify-rooms.mjs`, `scripts/verify-input.mjs`, `scripts/verify-career-store.mjs`, and `scripts/verify-app.mjs`.

If npm is installed, `npm start`, `npm run check`, `npm test`, and `npm run test:deep` are optional shortcuts. npm is not required and was unavailable on the validation host.

The full physical-playthrough and release verification results are recorded in [PLAYTEST.md](PLAYTEST.md). Publishing instructions and store-page copy are in [RELEASE.md](RELEASE.md).

## Source layout

| File | Responsibility |
| --- | --- |
| `dist/index.html`, `dist/style.css` | Responsive interface, dialogs, typography, and visual theme |
| `dist/app.js` | Application flow, input integration, audio, and browser lifecycle |
| `dist/ui.js` | Room previews, navigation, upgrade comparisons, and menu markup |
| `dist/input.js` | Pointer ownership, relative joystick, keyboard direction, and capture cleanup |
| `dist/career-store.js` | Queued career transactions, latest-save reads, optional Web Locks, and memory fallback |
| `dist/simulation.js` | Robot movement, suction, bags, stations, debris, and finishing sweeps |
| `dist/rooms.js` | Authored campaign layouts, location palettes, seeded rooms, and walkability |
| `dist/progression.js` | Upgrade prices, rewards, unlocks, validated saves, and replay protection |
| `dist/render.js`, `dist/icon.svg` | Original Canvas and SVG artwork |
| `scripts/` | Local serving and automated verification |

The renderer draws a 960 × 640 world while the surrounding interface adapts to the available screen. Room layouts use a small walkability grid. Simulation and progression are separate so physical collection, currency integrity, and content reachability can be checked independently.

Saves use the versioned key `sweep-shift-career-v1`. Invalid values are bounded or discarded, and unlocked rooms are derived from a contiguous completed campaign route. The recent-run history prevents the same completed run from being credited repeatedly after a reload.

Career changes read the latest save before applying a transaction. Where supported, Web Locks serialize these transactions across tabs. A failed read or write preserves the current tab's career in memory for the rest of the session, so an older disk save cannot silently replace it. The fallback without Web Locks does not guarantee cross-process atomicity in every browser.

## Credits and development

Created by **Nathan Norris** with AI assistance for implementation, design iteration, writing, and testing. Artwork is drawn with original Canvas and SVG code; sound effects are synthesized using Web Audio. The playable game does not download fonts, art packs, audio files, or third-party runtime libraries.

There is no account system, backend, analytics service, or online leaderboard. Verification reports distinguish automated simulation, browser playtesting, and any device checks that were actually performed. Source availability is not a claim that every supported device or browser engine has been tested.

## Design research

[Comparable-game notes](docs/COMPARABLE-GAMES.md) record official store-page research and the resulting original wording: literal navigation, clear controls, a visible cleaning-to-upgrades loop, and optional medal goals.
