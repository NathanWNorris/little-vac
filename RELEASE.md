# Sweep Shift 1.2.0 local release candidate

The current **1.2.0** build is local. The reviewed **itch.io draft** still hosts **1.1.0** and was not changed during this redesign. Public publishing has not been performed.

## Verified build

- Archive: artifacts/sweep-shift-itch.zip
- Contents: **11 files**, index.html at root, no external runtime dependencies or QA fixtures.
- Size: **48,351 bytes**.
- SHA-256: **122a6ede29c779431f70dcc629e78d891fbb9a79ecd5b037efefa0d5da2144a9**.
- All source, archive, and extracted hashes match. The exact package displayed v1.2.0, started a room, and opened Pause without browser errors or warnings.
- Syntax, all 19 app checks, and all 17 input checks passed. Desktop and phone viewport checks covered the new menu, Rooms, Upgrades, gameplay, and dialogs; the 960 × 800 packaged play view fits without scrolling.
- The normal preview retained the player's one completed room and 30 coins. No migration is needed.

See [redesign checks](docs/REDESIGN-1.2.0.md) for this pass. The larger campaign, physics, economy, save, and real-play audits in [1.1.2](docs/AUDIT-1.1.2.md) and [PLAYTEST.md](PLAYTEST.md) are historical evidence; this redesign did not modify those systems. No physical-phone, Safari, or Firefox test is claimed.

## What changed in 1.2.0

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

The [existing itch.io draft](https://fooded.itch.io/sweep-shift), project **5021059**, received the **1.1.0** ZIP and five screenshots in the previous audit. At that time, reload confirmed the browser-playable upload, revised tagline/description, and Draft visibility. The five refreshed screenshots are first in the saved gallery; two earlier screenshots remain afterward. The uploaded iframe loaded version 1.1, retained the existing 365-coin career, started room 2, handled pickup/pause, and kept the room intact through the former Upgrades/Resume flow. Its error/warning log was empty. These are historical checks; **1.1.1, 1.1.2, and 1.2.0 have not been uploaded**, and the final public-publish action has not been taken.

## Rebuild

Run **node scripts/check.mjs**, then **node scripts/verify.mjs**; use **--deep** for the extended physics audit and **node scripts/verify-builds.mjs** for the optional 120 Hz build matrix. Package with **./scripts/package-release.ps1** in PowerShell. Serve the extracted archive using **node scripts/serve.mjs --package** with a separate PORT. Record the new manifest and packaged browser results before uploading, then verify the actual hosted build after upload.
