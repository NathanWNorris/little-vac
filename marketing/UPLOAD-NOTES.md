# Sweep Shift 1.6.1 — upload handoff

Updated September 19, 2026. The tested game ZIP, current description, and current PNG assets have been uploaded to the existing itch.io draft. The actual hosted game displays v1.6.1 and passed the hosted smoke test described below. Draft remains selected; the page has not been published publicly.

Draft: https://fooded.itch.io/sweep-shift (project 5021059).

## Files in artifacts/publish-1.6.1

- `sweep-shift-itch.zip`: HTML game, index.html at its root, 12 runtime files.
- `cover.png`: 1260 × 1000 cover image.
- `banner.png`: 1260 × 320 page banner.
- `launch.png`: 960 × 800 launch image.
- `gallery/`: six current screenshots. These replace the old 1.1.0 gallery; do not use the historical JPGs elsewhere in marketing.
- `description.html`: current store description.
- `manifest.json`: file sizes and SHA-256 hashes.

Short description: **Clean 50 areas, upgrade your vacuum, and open new hallways. Finish 24 jobs to unlock Endless Shift.**

## Saved draft setup

The ZIP is uploaded as the browser-playable HTML game. The current tagline and description, cover, banner, launch image, and all six new gallery screenshots persisted. The user removed seven obsolete screenshots after a deletion dialog stalled browser control. Store colors saved as background #17292d, content #f2e6c9, text #203b3b, and links #a63e27. The existing free/no-payments setup and AI-assistance disclosure are retained. The previously recorded embed size is 960 × 800 with fullscreen and scrollbars enabled, autostart disabled.

The actual hosted iframe loaded and displayed footer v1.6.1: https://html-classic.itch.zone/html/19303530/index.html?v=1789828455. Click/mouse steering cleaned Room 2 to 5%, carrying 16 / 120 pieces worth 22 coins. Escape paused; Upgrades prompted once; Keep playing retained the run; confirmed quitting opened the shop directly and did not pay unfinished coins. Reload preserved the existing Room 2 unlock, 5 saved coins, and ranks Wider sweep 1 / Bigger bag 1 / Quicker wheels 0 / Stronger suction 0. A fresh test job accepted WASD activation and paused on a click outside the iframe. Warning/error logs were empty during these checks, before the separate fullscreen attempts below. The hosted game was returned to Home without an unfinished test job.

Fullscreen limitation: two attempts to use itch.io's external Enter fullscreen button did not activate fullscreen under automated Chrome. The host page logged TypeError: not granted and NotSupportedError for unavailable screen.orientation.lock. These were host-page errors, not game-iframe errors; embedded gameplay was unaffected. Fullscreen is not verified. No game or host-button change was made.

The hosted smoke test did not complete a job or buy an upgrade. Completed-job rewards and new-purchase persistence were verified in the local browser pass below; they are not claimed as hosted playthrough results.

Keep the page in Draft. The user's publishing boundary is to stop at the final public-publish action, even after hosted checks finish.

## Validation scope

The current standard suite passed all 24 campaign jobs / 50 areas, three Endless runs, and 84 app/input/save/progression groups. The local browser pass completed Room 1 normally, bought the first earned upgrade, verified its save after reload, and cleaned the first area of the four-area Room 22 before traveling both ways through its unlocked hall. Arcade and greenhouse checks were partial plays. These completed-job checks were local, not hosted. Wider stress testing is recorded in PLAYTEST.md; this was not a manual replay of the entire campaign or a physical-phone test.

No new production gameplay bug was reproduced in this pass. The game ZIP is unchanged from the verified 1.6.1 build. Its SHA-256 is `573520085d2c25f00144c4e8562cae6b14841809fac374071446d27da5f67d00`.
