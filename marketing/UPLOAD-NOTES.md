# Sweep Shift 1.6.2 — upload handoff

Updated September 19, 2026. The 1.6.2 game ZIP is uploaded to the existing itch.io draft. Reload confirmed the actual hosted version, shorter description, and simplified store setup. The Draft badge remains visible; the page has not been published publicly.

Draft: https://fooded.itch.io/sweep-shift (project 5021059).

## Files in artifacts/publish-1.6.2

- `sweep-shift-itch.zip`: HTML game, index.html at its root, 12 runtime files.
- `cover.png`: 1260 × 1000 cover image.
- `launch.png`: 960 × 800 launch-image backup. The new setup loads Home automatically.
- `gallery/`: six current screenshots. These replace the old 1.1.0 gallery; do not use the historical JPGs elsewhere in marketing.
- `description.html`: current store description.
- `manifest.json`: file sizes and SHA-256 hashes.

No page banner is required. The previous banner remains in the historical `publish-1.6.1` folder as a backup.

Short description: **Clean 50 areas, upgrade your vacuum, and open new hallways. Finish 24 jobs to unlock Endless Shift.**

## Draft setup

Use the ZIP as the browser-playable HTML game. Retain the current cover, six gallery screenshots, free/no-payments setup, and AI-assistance disclosure. Store colors are background #17292d, content #f2e6c9, text #203b3b, and links #a63e27. The embed is 960 × 800 with fullscreen and scrollbars enabled.

The saved update enables autostart so the unchanged Home screen appears without a separate launch-image click, removes the oversized page banner, and uses the 197-word `description.html`. The saved theme and exactly six gallery links persisted after reload. Home autoloading does not begin a cleaning job. The actual hosted footer displays v1.6.2.

Hosted check: Continue from the existing completed-Room-1 career opened Room 2 with its floor visible and a compact left-click/WASD prompt. The vacuum was parked at 0% with an empty 0 / 120 bag. Pressing D removed the prompt and started the job. Pause → How to play still displayed the full three-step illustrated guide. This targeted check did not complete another job or buy an upgrade.

Historical fullscreen limitation: itch.io's external fullscreen control could not be activated under automated Chrome during the 1.6.1 smoke test. Errors came from the host page, not the game iframe. Fullscreen remains unverified; this tutorial patch does not change it.

Keep the page in Draft. The user's publishing boundary is to stop at the final public-publish action, even after hosted checks finish.

Editor: https://itch.io/game/edit/5021059#published. Do not select Public or perform the final public-publish action.

## Validation scope

Version 1.6.2 replaces the full automatic picture guide with a compact start prompt after the first completed room. Manual How to play keeps the full guide. Targeted checks passed 42 app groups, 17 input groups, syntax checking, and desktop/320px visual QA. The new regression covers the first-success boundary, parked idle state, click/WASD starts, replay after reload, and manual Help.

Simulation, room content, balance, and saves are unchanged. The full 24-job/50-area campaign, three Endless runs, earned upgrade/reload browser check, and late-room hallway check belong to the prior 1.6.1 validation; they were not repeated for this small tutorial patch. PLAYTEST.md preserves the detailed evidence and limitations.

The 1.6.2 ZIP is 64,762 bytes. Its SHA-256 is `90c65a6ab10bb7e2596de99ed80fd9b5188ad45e1e701b0a056f09ecef2c1219`.
