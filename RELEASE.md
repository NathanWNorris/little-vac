# Sweep Shift 1.1.0 release

The publishing boundary is a reviewed **itch.io draft**. The owner makes the final choice to publish. A draft is not a public release.

## Verified build

- Archive: artifacts/sweep-shift-itch.zip
- Contents: **11 files**; index.html at root; eight JavaScript modules, CSS, and SVG icon; no fixtures, servers, or external runtime dependencies.
- Size: **47,133 bytes**.
- SHA-256: **6255aaaa75b94e12694d0a326ccc37e5432c9a0d575ea27e784132d0b3e12297**.
- Source, archive, extracted, and HTTP hashes match. Exact-package browser smoke checks passed.
- Automated audit: 14 progression, 10 input, 9 career-store, and 11 application groups; 1,000 generated layouts; all 24 campaign rooms with earned upgrades and again with a starter robot; 40 additional endless rooms; 86,400 random movement frames.
- Real Chrome playtest: completed room 7, earned the correct reward, purchased Bigger Bag, retained the save on reload, and started newly unlocked room 8 with the upgrade.

See [PLAYTEST.md](PLAYTEST.md) for precise evidence and limitations. No physical-phone, Safari, or Firefox test is claimed.

## What changed

- Persistent Rooms and Upgrades navigation, location selectors and actual room previews, next-room guidance, clear upgrade levels/benefits/prices, and saved/pending coin labels.
- Browse menus while keeping the current room paused; resume its cleaning and bag. New upgrades apply to the next room started.
- Fixed suction through furniture corners, full bags blocking keepsakes, dust remainder accounting, unrelated touch releases, stale-save overwrites, seed-zero replay, delayed restart/reset races, rejected reward screens, and delayed purchases taking over navigation.
- Original store and onboarding wording informed by [official comparable-game research](docs/COMPARABLE-GAMES.md).

## Store page

- Title: **Sweep Shift**.
- Short description: **Clean 24 rooms, earn coins, and upgrade a tiny vacuum robot. A cozy browser game with endless shifts to unlock.**
- Full formatted copy: [marketing/description.html](marketing/description.html).
- Type: HTML game; Simulation; free/no payments; comments enabled.
- Tags: cleaning, cozy, relaxing, singleplayer, top-down.
- Embed: **960 × 800**, mobile friendly, fullscreen control and scrollbars enabled; autostart disabled.
- Disclosure: AI-assisted Graphics, Text & Dialog, and Code; original procedurally synthesized audio described accurately.
- Existing cream/teal theme, robot cover, banner, and launch artwork retained.

Five refreshed gameplay/menu screenshots are marketing/01-rooms.jpg through 05-upgrades.jpg. The upgrade screenshot was taken in the same audit before the final supporting-sentence edit, with legitimately earned affordable upgrades visible. Previous PNG screenshots are retained as source backups.

## Draft status

The [existing itch.io draft](https://fooded.itch.io/sweep-shift), project **5021059**, received the new ZIP and five screenshots. Reload confirmed the browser-playable upload, new tagline/description, and Draft visibility. The five refreshed screenshots are first in the saved gallery; two earlier screenshots remain afterward. The actual uploaded iframe loaded version 1.1, retained the existing 365-coin career, started room 2, handled pickup/pause, and kept the room intact through Upgrades and Resume. Its browser error/warning log was empty. The final public-publish action has not been taken.

## Rebuild

Run **node scripts/check.mjs**, then **node scripts/verify.mjs --deep**. Package with **./scripts/package-release.ps1** in PowerShell. Serve the extracted archive using **node scripts/serve.mjs --package** with a separate PORT. Repeat the packaged/hosted browser smoke check whenever runtime code changes, and record the new manifest before uploading.
