# Sweep Shift 1.1.2 local release candidate

The current **1.1.2** build is local. The reviewed **itch.io draft** still hosts **1.1.0** and was not updated during this change. The owner makes the final choice to publish. A draft is not a public release.

## Verified build

- Archive: artifacts/sweep-shift-itch.zip
- Contents: **11 files**; index.html at root; eight JavaScript modules, CSS, and SVG icon; no fixtures, servers, or external runtime dependencies.
- Size: **48,328 bytes**.
- SHA-256: **e699ffca00f36127a38d84a0678dbcbab9365860311b534ab73423680cd054f0**.
- Source, archive, and extracted hashes match. The exact package displayed v1.1.2, started a room, showed the finish target, and kept the room paused throughout How to play. The 390 × 844 phone and 960 × 800 embed layouts fit; browser error/warning logs were empty.
- Current automated audit: syntax; 14 progression, 17 input, nine career-store, and 19 application groups; 1,000 generated layouts; all 24 campaign rooms with earned upgrades; three Endless rooms and one replay.
- Current deep audit: all 24 rooms without upgrades, 40 additional Endless rooms, and 86,400 random movement frames. The optional build audit adds 144 campaign completions across six builds plus nine Endless inputs at production's 120 Hz timestep.
- Real Chrome playthrough: room 7 completion awarded 332 cleaning coins plus 135 bonuses; saved balance 395 → 862. Bigger bag purchase cost 550, leaving 312. Reload retained the upgrade; room 8 opened at 180 capacity. The result breakdown and next actions were visually checked.

See the [1.1.2 audit](docs/AUDIT-1.1.2.md) for current evidence and [PLAYTEST.md](PLAYTEST.md) for historical results. No physical-phone, Safari, or Firefox test is claimed.

## What changed in 1.1.2

- Fixed stale mouse steering after keyboard input, including very short taps and opposite keys; ignored mouse clicks outside the rendered room.
- Fixed room startup running behind an open dialog and delayed ending saves replacing later navigation.
- Added a visible 95% finish target, reusable How to play instructions, explicit replay/treasure labels, and an itemized result balance.
- Corrected dock wording and singular coin messages. Progression and prices are unchanged.

## Previous 1.1.1 changes

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

The [existing itch.io draft](https://fooded.itch.io/sweep-shift), project **5021059**, received the **1.1.0** ZIP and five screenshots in the previous audit. At that time, reload confirmed the browser-playable upload, revised tagline/description, and Draft visibility. The five refreshed screenshots are first in the saved gallery; two earlier screenshots remain afterward. The uploaded iframe loaded version 1.1, retained the existing 365-coin career, started room 2, handled pickup/pause, and kept the room intact through the former Upgrades/Resume flow. Its error/warning log was empty. These are historical checks; **1.1.1 and 1.1.2 have not been uploaded**, and the final public-publish action has not been taken.

## Rebuild

Run **node scripts/check.mjs**, then **node scripts/verify.mjs**; use **--deep** for the extended physics audit and **node scripts/verify-builds.mjs** for the optional 120 Hz build matrix. Package with **./scripts/package-release.ps1** in PowerShell. Serve the extracted archive using **node scripts/serve.mjs --package** with a separate PORT. Record the new manifest and packaged browser results before uploading, then verify the actual hosted build after upload.
