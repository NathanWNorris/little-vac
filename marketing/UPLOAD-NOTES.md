# Little Vac 1.6.3 — upload handoff

Updated September 19, 2026. Version **1.6.3** is the Little Vac branding update. Packaging, refreshed artwork capture, and the GitHub/itch.io renames are complete. Hosted upload and verification are pending. The page remains in Draft and has not been published publicly.

Current draft destination: https://fooded.itch.io/little-vac (existing project 5021059). Current source destination: https://github.com/NathanWNorris/little-vac. Both remote renames have been saved. The 1.6.3 build still needs upload and actual hosted verification.

## Files in artifacts/publish-1.6.3

- `little-vac-itch.zip`: HTML game with index.html at its root, **12 runtime files**, **64,759 bytes**, SHA-256 `d8e1db30193e66843f193aaeafbfcdfac69de94a1c9455bde4c6d452e2807d39`. Source, archive, and extraction hashes match.
- `cover.png`: 1260 × 1000 cover, regenerated from the Little Vac template.
- `launch.png`: 960 × 800 launch-image backup, regenerated with the new name. The store loads Home automatically.
- `gallery/`: six current screenshots. Rooms and Upgrades were recaptured with Little Vac branding; four gameplay images contain no old wordmark and are unchanged.
- `description.html`: current store description, opening with the Little Vac name.
- `manifest.json`: file sizes and SHA-256 hashes for every other file in this handoff.

No page banner is required. The branded banner template is retained as an optional source asset, not a required store element.

Short description: **Clean 50 areas, upgrade your vacuum, and open new hallways. Finish 24 jobs to unlock Endless Shift.**

## Draft setup

Use the ZIP as the browser-playable HTML game. Retain the six-image gallery, free/no-payments setup, and AI-assistance disclosure. Store colors are background #17292d, content #f2e6c9, text #203b3b, and links #a63e27. The embed is 960 × 800 with fullscreen and scrollbars enabled.

Keep autostart enabled so the Home screen appears without a separate launch-image click. Home autoloading does not begin a cleaning job. Preserve the compact prompt after the first completed room and the full manual picture guide. Check the Little Vac title, cover, current gallery, description, and version 1.6.3 on the actual hosted build after upload.

The legacy `sweep-shift-career-v1` save key stays unchanged for compatibility. This is a branding update; no new campaign, balance, or save-format change is claimed.

Keep the page in Draft. The user's publishing boundary is to stop at the final public-publish action, even after hosted checks finish.

Editor: https://itch.io/game/edit/5021059#published. Do not select Public or perform the final public-publish action.

## Current validation

Version 1.6.3 passed 42 app groups, 17 input groups, syntax checking, and package integrity checks. The new cover, launch, and optional banner have the required 1260 × 1000, 960 × 800, and 1260 × 320 dimensions. Hosted upload, title/artwork review, startup/help checks, and final Draft verification remain pending.

Five obsolete JPG screenshots are preserved locally in `artifacts/legacy-branding-1.6.2` and in Git history. They are not included in this handoff.

## Historical validation

Version 1.6.2 passed 42 app groups, 17 input groups, syntax checking, and desktop/320px visual QA. Its actual hosted startup/help check confirmed the compact start prompt, WASD activation, full manual guide, automatic Home loading, no oversized page banner, and six gallery links. Those are historical results, not validation of the renamed 1.6.3 package.

The historical 1.6.2 archive is `artifacts/publish-1.6.2/sweep-shift-itch.zip`, 64,762 bytes, SHA-256 `90c65a6ab10bb7e2596de99ed80fd9b5188ad45e1e701b0a056f09ecef2c1219`. Earlier archives and artwork remain historical evidence; do not relabel their hashes as 1.6.3 results.

The full 24-job/50-area campaign and deeper engine checks belong to earlier validation documented in PLAYTEST.md. No physical-phone test is claimed. itch.io's external fullscreen control could not be activated under automated Chrome during the 1.6.1 smoke test; errors came from the host page, not the game iframe. Fullscreen remains unverified.
