# Sweep Shift 1.1.1 local release candidate

The current **1.1.1** build is local. The reviewed **itch.io draft** still hosts **1.1.0** and was not updated during this change. The owner makes the final choice to publish. A draft is not a public release.

## Verified build

- Archive: artifacts/sweep-shift-itch.zip
- Contents: **11 files**; index.html at root; eight JavaScript modules, CSS, and SVG icon; no fixtures, servers, or external runtime dependencies.
- Size: **47,475 bytes**.
- SHA-256: **01ccf41c073ad211034029b185927e7eff07cd6aa2782774728eee5401497a64**.
- Source, archive, and extracted hashes match. The exact package displayed v1.1.1, started room 1, blocked midroom Upgrades, and returned to play after cancellation. The 390 × 844 layout fit without horizontal overflow; browser error/warning logs were empty.
- Current automated audit: syntax; 14 progression, 14 input, 9 career-store, and 15 application groups; 1,000 generated layouts; all 24 campaign rooms with earned upgrades; three Endless rooms and one replay.
- Current isolated-browser check: room 7 blocked midroom Upgrades; mouse release allowed continued following; cancelled quit retained the run; confirmed quit opened Upgrades, retained 395 saved coins, and discarded 45 pending coins. Error/warning logs were empty.
- Historical 1.1.0 validation also covered a starter-robot campaign, 40 additional Endless rooms, 86,400 random-movement frames, real Chrome completion/purchase/reload, and the hosted draft. Those checks were not newly repeated for 1.1.1.

See [PLAYTEST.md](PLAYTEST.md) for precise evidence and limitations. No physical-phone, Safari, or Firefox test is claimed.

## What changed in 1.1.1

- Move the mouse over the room to guide the vacuum without holding a button. Touch dragging and keyboard movement remain available; leaving the room or pausing clears mouse movement.
- Finish the room, or pause and confirm quitting, before buying upgrades or changing shells. A paused room cannot be upgraded through menu navigation or a delayed purchase. Quit confirmation explains that unfinished coins and cleaning will be lost; previously saved progress remains.
- Updated control and upgrade instructions to match the new behavior.

## Previous 1.1.0 changes

- Persistent Rooms and Upgrades navigation, location selectors and actual room previews, next-room guidance, clear upgrade levels/benefits/prices, and saved/pending coin labels.
- Browse menus while keeping the current room paused; resume its cleaning and bag. The former midroom upgrade-shopping flow is superseded by 1.1.1.
- Fixed suction through furniture corners, full bags blocking keepsakes, dust remainder accounting, unrelated touch releases, stale-save overwrites, seed-zero replay, delayed restart/reset races, rejected reward screens, and delayed purchases taking over navigation.
- Original store and onboarding wording informed by [official comparable-game research](docs/COMPARABLE-GAMES.md).

## Existing 1.1.0 store page

- Title: **Sweep Shift**.
- Short description: **Clean 24 rooms, earn coins, and upgrade a tiny vacuum robot. A cozy browser game with endless shifts to unlock.**
- Updated local copy for the next upload: [marketing/description.html](marketing/description.html).
- Type: HTML game; Simulation; free/no payments; comments enabled.
- Tags: cleaning, cozy, relaxing, singleplayer, top-down.
- Embed: **960 × 800**, mobile friendly, fullscreen control and scrollbars enabled; autostart disabled.
- Disclosure: AI-assisted Graphics, Text & Dialog, and Code; original procedurally synthesized audio described accurately.
- Existing cream/teal theme, robot cover, banner, and launch artwork retained.

Five refreshed gameplay/menu screenshots are marketing/01-rooms.jpg through 05-upgrades.jpg. The upgrade screenshot was taken in the same audit before the final supporting-sentence edit, with legitimately earned affordable upgrades visible. Previous PNG screenshots are retained as source backups.

## Draft status: still 1.1.0

The [existing itch.io draft](https://fooded.itch.io/sweep-shift), project **5021059**, received the **1.1.0** ZIP and five screenshots in the previous audit. At that time, reload confirmed the browser-playable upload, revised tagline/description, and Draft visibility. The five refreshed screenshots are first in the saved gallery; two earlier screenshots remain afterward. The uploaded iframe loaded version 1.1, retained the existing 365-coin career, started room 2, handled pickup/pause, and kept the room intact through the former Upgrades/Resume flow. Its error/warning log was empty. These are historical checks; **1.1.1 has not been uploaded**, and the final public-publish action has not been taken.

## Rebuild

Run **node scripts/check.mjs**, then **node scripts/verify.mjs**; use **--deep** for the extended physics audit. Package with **./scripts/package-release.ps1** in PowerShell. Serve the extracted archive using **node scripts/serve.mjs --package** with a separate PORT. Record the new manifest and packaged browser results before uploading, then verify the actual hosted build after upload.
