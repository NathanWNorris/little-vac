# Sweep Shift

**A little mess. A lovely clean.**

Sweep Shift is a cozy browser game about a small vacuum robot making colorful rooms feel good again. Glide through a mess, watch scraps swirl into your bag, visit a collection station, and spend your cleaning coins on a more capable little robot.

The campaign has 24 authored rooms across a workshop, an after-hours arcade, a greenhouse, and a rooftop party. Finish the campaign to unlock Endless Shift: reproducible generated rooms that can be revisited using a seed.

## Play

- Move with **WASD or the arrow keys**, or **hold the mouse button** where you want the robot to go.
- On a touchscreen, **drag to steer** with the movement joystick.
- Suction is automatic. Park beside a **collection station** to empty the bag automatically.
- A full bag stops suction, but the robot can still move normally.
- Clean **95%** of a room to trigger its finishing sweep. The remaining scraps and everything in the bag are paid automatically.
- Press **Escape** or use **Pause** for a break. Sound and reduced motion are available in Settings.

There are no lives or mandatory time limits. Bronze rewards finishing; optional silver and gold medals reward faster routes. The timer and target times are tucked into Room details.

## Progression

Four upgrade categories each have five purchasable ranks: cleaning width, bag capacity, movement speed, and pull strength. Every location completed unlocks another cosmetic shell, for five shells in total. Each campaign room also contains one optional trinket for the collection shelf.

Completing a room unlocks the next one regardless of medal, trinket, or upgrade choices. Replays pay their cleaning coins again; completion bonuses, medal improvements, and trinket bonuses are awarded only when newly earned.

Coins, completed rooms, medals, best times, upgrades, shells, trinkets, and settings save in this browser. A room's coins enter your career balance only after completion. Leaving an unfinished room discards all of its cleaning and coins, including material already emptied at a station. Clearing browser data also clears the career. If browser storage is blocked, a visible warning explains that the current session cannot be saved.

## Run locally

The game itself has no external runtime dependencies. A recent Node.js installation is needed only for the local server and verification scripts; no package installation is required.

```sh
node scripts/serve.mjs
```

Open `http://127.0.0.1:4180/`. The server binds to the local computer. Serve the files over HTTP rather than opening `index.html` directly, because the source uses JavaScript modules.

```sh
node scripts/verify.mjs
```

The test suite checks progression, room generation, and real movement/suction through the entire campaign and several endless rooms. Individual checks can also be run with `node scripts/verify-progression.mjs` or `node scripts/verify-rooms.mjs`.

If npm is installed, `npm start`, `npm run check`, and `npm test` are optional shortcuts for local serving, syntax checks, and the test suite. npm is not required and was unavailable on the validation host.

The full physical-playthrough and release verification results are recorded in [PLAYTEST.md](PLAYTEST.md). Publishing instructions and store-page copy are in [RELEASE.md](RELEASE.md).

## Source layout

| File | Responsibility |
| --- | --- |
| `dist/index.html`, `dist/style.css` | Responsive interface, dialogs, typography, and visual theme |
| `dist/app.js` | Screens, keyboard/pointer/touch input, audio, and game flow |
| `dist/simulation.js` | Robot movement, suction, bags, stations, debris, and finishing sweeps |
| `dist/rooms.js` | Authored campaign layouts, location palettes, seeded rooms, and walkability |
| `dist/progression.js` | Upgrade prices, rewards, unlocks, validated saves, and replay protection |
| `dist/render.js`, `dist/icon.svg` | Original Canvas and SVG artwork |
| `scripts/` | Local serving and automated verification |

The renderer draws a 960 × 640 world while the surrounding interface adapts to the available screen. Room layouts use a small walkability grid. Simulation and progression are separate so physical collection, currency integrity, and content reachability can be checked independently.

Saves use the versioned key `sweep-shift-career-v1`. Invalid values are bounded or discarded, and unlocked rooms are derived from a contiguous completed campaign route. The recent-run history prevents the same completed run from being credited repeatedly after a reload.

## Credits and development

Created by **Nathan Norris** with AI assistance for implementation, design iteration, writing, and testing. Artwork is drawn with original Canvas and SVG code; sound effects are synthesized using Web Audio. The playable game does not download fonts, art packs, audio files, or third-party runtime libraries.

There is no account system, backend, analytics service, or online leaderboard. Verification reports distinguish automated simulation, browser playtesting, and any device checks that were actually performed. Source availability is not a claim that every supported device or browser engine has been tested.
