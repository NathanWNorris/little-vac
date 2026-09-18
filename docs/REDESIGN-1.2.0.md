# Sweep Shift 1.2.0 interface redesign

Requested direction: a different theme, less decorative wording, and an obvious home menu.

## Changes

- Flat charcoal and amber colors, system sans-serif type, compact square controls, and a matching original SVG robot icon.
- Home contains Play/Continue/Resume room, Rooms, Upgrades, and How to play. The next room and saved progress each appear once.
- Removed the promotional hero, animated title canvas, decorative chips, repeated progress panels, and oversized next-room banner.
- Rooms are compact rows with a preview, number, name, prerequisite or record, and explicit Play/Replay/Locked label.
- Upgrades retain numerical current/next effects, prices, earned balance, and unlock requirements.
- Pause, Settings, Treasures, Credits, and results use direct titles and shorter wording.
- The game rules, upgrade prices, save format, campaign, mouse following, and between-room purchase restriction are unchanged.

## Verification — September 17, 2026

- Syntax check passed for eight game modules and ten development/test scripts.
- All 19 application orchestration checks and 17 input regression checks passed. A separate read-only review found no concrete functional or accessibility regressions.
- Browser checked fresh and six-room earned careers, Play/Continue labels, room selection, upgrade comparisons, pause, locked upgrades, confirmed quit-to-shop, and return to the home menu with an active room.
- A mouse click and release was followed by continued movement from approximately (210, 536) to (590, 489), collecting 12 pieces without holding the button. Returning through Rooms to Home showed Resume room and Paused at 5%.
- Visually checked desktop, 390 × 844, and 320 × 640 menu layouts. No horizontal overflow was observed. The 390-pixel play layout includes a separate joystick tray below the complete room.
- Fixed a small vertical overflow at the 960 × 800 embed size. The final packaged game has a document height of exactly 800 and the canvas bottom at approximately 741 pixels.
- The exact archive was extracted, its 11 source hashes verified, and its served build displayed v1.2.0, started room 1, and opened Pause. Browser error/warning logs were empty.
- Opened the normal 4180 preview on the new home screen; the existing career still shows one completed room, 30 coins, and room 2 next. Player progress was not used for testing or changed.

This pass tested the interface and input paths. The extensive physics, campaign, and economy evidence from [1.1.2](AUDIT-1.1.2.md) remains historical; those systems were not modified or retested in full. Phone sizes were desktop browser viewport checks, not physical-device tests.

## Delivery

Local preview: http://127.0.0.1:4180/

Archive: `artifacts/sweep-shift-itch.zip` — 48,351 bytes, 11 files, root `index.html`.

SHA-256: `122a6ede29c779431f70dcc629e78d891fbb9a79ecd5b037efefa0d5da2144a9`.

The itch.io draft was not changed. Its prior cream/teal storefront and screenshots need a coordinated refresh before uploading this theme.
