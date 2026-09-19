# Sweep Shift 1.6.1 — upload handoff

Prepared September 19, 2026. The game ZIP and these assets are local release files; this does not mean the itch.io draft has been updated or published.

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

## Draft setup

Use the ZIP as the browser-playable HTML upload. Keep the existing free/no-payments setup and AI-assistance disclosure. The previously recorded embed size is 960 × 800 with fullscreen and scrollbars enabled, autostart disabled. The cover, banner, launch image, and screenshot gallery should all use the PNGs in this folder.

The current game was checked in a local 960 × 800 cross-origin sandboxed iframe. After uploading, check the actual itch.io embed: footer v1.6.1, Play → instructions → click or WASD start, Pause, Upgrades → one confirmation → Keep playing. Confirm a completed room saves after reloading. The local iframe check does not replace this hosted check.

Keep the page in Draft until that hosted check is complete. The user's earlier publishing boundary was to stop at the final public-publish action.

## Validation scope

The current standard suite passed all 24 campaign jobs / 50 areas, three Endless runs, and 84 app/input/save/progression groups. The live browser pass completed Room 1 normally, bought the first earned upgrade, verified its save after reload, and cleaned the first area of the four-area Room 22 before traveling both ways through its unlocked hall. Arcade and greenhouse checks were partial plays. Wider stress testing is recorded in PLAYTEST.md; this was not a manual replay of the entire campaign or a physical-phone test.

No new production gameplay bug was reproduced in this pass. The game ZIP is unchanged from the verified 1.6.1 build. Its SHA-256 is `573520085d2c25f00144c4e8562cae6b14841809fac374071446d27da5f67d00`.
