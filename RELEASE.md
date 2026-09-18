# Sweep Shift 1.2.2 local release candidate

The current **1.2.2** build is local. The reviewed **itch.io draft** still hosts **1.1.0** and was not changed during this update. Public publishing has not been performed.

## Verified build

- Archive: artifacts/sweep-shift-itch.zip
- Contents: **11 files**, index.html at root, no external runtime dependencies or QA fixtures.
- Size: **45,633 bytes**.
- SHA-256: **71e06836f749d333d31bebfb4cca6ceee48bf03c5a6b7a84be09d5977b9c10ec**.
- All source, archive, and extracted hashes match.
- Syntax and standard verification passed: 16 progression, 17 input, 10 store, and 28 app groups; 1,000 generated layouts; 24 earned-upgrade campaign completions; 3 Endless completions; replay. Targeted app checks passed again after the final focus fix.
- Isolated browser checks confirmed a stopped timer before Start, primary-click activation, Space-button activation, restart readiness, live movement after starting, and canvas focus after clicking. Instructions fit 320×640 and 960×500 viewports without internal scrolling or horizontal overflow. No browser errors or warnings were reported.
- The previous 1.2.1 audit also covered a deeper campaign matrix, full room-13 and room-1 browser runs, earned purchases/reload, and postgame menus. These unchanged mechanics were not manually replayed end-to-end for this start-screen update.
- Existing v1 saves migrate consistently without losing progress. Player save data was not used for testing or reset.

See [the previous deep audit](docs/AUDIT-1.2.1.md) for earlier evidence and limits. Phone layout checks used browser viewports, not physical devices. Touch start-and-drag behavior is covered by the input/app tests; a physical touchscreen was not tested.

## What changed in 1.2.2

- Every new, restarted, replayed, or Endless room waits for a primary click before movement, suction, or timing starts.
- A compact instruction screen explains steering without holding, automatic vacuuming, green docks, the 95% goal, and upgrades after completion.
- Start supports native Enter/Space button activation and touch taps. Pausing or browsing menus preserves whether a room has started.
- Hovering, movement keys, secondary clicks, and agent movement cannot bypass the start screen. Waiting time and stale inputs are cleared on activation.
- Focus returns to Start after dialogs while waiting, then to the canvas after starting. Save format and progress are unchanged.

## What changed in 1.2.1

- Fixed 95% completion failing at a floating-point dust boundary.
- Prevented old rooms from awarding coins after a career reset in another tab; added deterministic legacy-save migration and reset generations.
- Refreshed home and treasure totals after cross-tab changes; stopped delayed ending saves from claiming a reset campaign is complete.
- Fixed the completed-career shop's Choose a room destination and clarified endgame room guidance.
- Increased phone goal/tip text, improved narrow HUD spacing, removed duplicate play-screen balance, and trimmed stylesheet whitespace.

## Previous 1.2.0 changes

- Replaced the pastel interface with a flat charcoal-and-amber theme and a matching SVG robot icon.
- Replaced the promotional home page with a simple Play/Continue/Resume menu, Rooms, Upgrades, and How to play.
- Made room selection a compact list with explicit Play, Replay, and Locked labels; removed repeated progress banners and decorative copy.
- Kept upgrade effects, prices, locked prerequisites, save progress, and existing game rules intact.
- Simplified titles and instructions throughout menus and results; verified responsive layouts and preserved between-room purchase locks.

## Previous 1.1.2 changes

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
- The hosted store still uses the prior cream/teal theme, robot cover, banner, and launch artwork. Refresh these to match 1.2.0 before the next upload.

Five prior 1.1.0 gameplay/menu screenshots are marketing/01-rooms.jpg through 05-upgrades.jpg. The upgrade screenshot was taken in the same audit before the final supporting-sentence edit, with legitimately earned affordable upgrades visible. Previous PNG screenshots are retained as source backups.

## Draft status: still 1.1.0

The [existing itch.io draft](https://fooded.itch.io/sweep-shift), project **5021059**, received the **1.1.0** ZIP and five screenshots in the previous audit. At that time, reload confirmed the browser-playable upload, revised tagline/description, and Draft visibility. The five refreshed screenshots are first in the saved gallery; two earlier screenshots remain afterward. The uploaded iframe loaded version 1.1, retained the existing 365-coin career, started room 2, handled pickup/pause, and kept the room intact through the former Upgrades/Resume flow. Its error/warning log was empty. These are historical checks; **1.1.1, 1.1.2, 1.2.0, and 1.2.1 have not been uploaded**, and the final public-publish action has not been taken.

## Rebuild

Run **node scripts/check.mjs**, then **node scripts/verify.mjs**; use **--deep** for the extended physics audit and **node scripts/verify-builds.mjs** for the optional 120 Hz build matrix. Package with **./scripts/package-release.ps1** in PowerShell. Serve the extracted archive using **node scripts/serve.mjs --package** with a separate PORT. Record the new manifest and packaged browser results before uploading, then verify the actual hosted build after upload.
