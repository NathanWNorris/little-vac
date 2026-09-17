# Sweep Shift 1.1.2 audit

This local audit continues from 1.1.1. It covers controls, app transitions, room completion, progression, and interface clarity. The hosted itch.io draft remains 1.1.0; this audit does not claim a new upload or publication.

## Reproduced defects and fixes

| Finding | Reproduction | Correction |
| --- | --- | --- |
| Keyboard release restored an old mouse target | Mouse target to the right, keyboard movement, then release produced positive horizontal steering instead of stopping. Opposing keys also fell through to the mouse target. | Directional keys relinquish the old pointer. New mouse movement resumes following. |
| A quick keyboard tap could miss the handoff | Chrome showed continued mouse following after a short arrow-key press. A keydown/keyup between animation frames left target `(550, 540)` active in the app regression. | Clear pointer input at keydown, preserving other held keyboard keys. The regression now confirms no subsequent robot movement. |
| Letterbox clicks could target outside the room | A click in a wide canvas's side margin produced world target `x = -80`, steering toward a wall. | Pointer-down uses the same in-room bounds check as hovering. Touch/tray controls retain their own gesture behavior. |
| Delayed room startup ran behind Settings | Hold the save lock, start a room, open Settings, then release the lock. The new room reported unpaused despite the visible dialog. | Screen transitions retain dialog pause state. The frame loop also checks whether a dialog is open. |
| An ending save replaced later navigation | Hold the ending save, navigate to Rooms, release the save. The screen unexpectedly became Ending. | A screen revision check preserves the player's later navigation choice. |
| Instructions did not match the dock art | Room 2 said the collection station was striped, while the renderer draws a green dock. | The hint now says green dock. A one-coin unload message also uses the singular form. |

The existing user-requested rules remain: mouse follows without a held button, and upgrades stay locked until the room is completed or explicitly quit. Pausing or browsing cannot bypass that restriction.

## Research applied

[Primary-source notes](COMPARABLE-GAMES.md) distinguish developer statements from our design judgments. PowerWash Simulator's developer help explains remaining-dirt guidance; Loddlenaut's official updates address pollution tracking and completion errors; Fresh Start's updates add reusable controls help and explicit replay actions.

The resulting changes are deliberately small:

- A persistent **Finish at 95%** label beside cleaning progress.
- **Pause → How to play**, available in every room and paused while open.
- **Replay room**, best time, and found/missing treasure status on completed room cards; a short room description on the next room.
- A **Room complete!** heading and separate cleaning earnings, new bonuses, and saved balance. Missing treasures remain optional and can be found on replay.

Existing automatic debris outlines near the end and the 95% finishing sweep remain. Prices, rewards, authored room layouts, and unlock requirements are unchanged. Simulated solvability does not establish human enjoyment or ideal pacing.

## Automated verification

```sh
node scripts/check.mjs
node scripts/verify.mjs --deep
node scripts/verify-builds.mjs
```

- Syntax: eight game modules and ten development/test scripts.
- 14 progression groups, 17 input groups, nine career-store groups, and 19 app groups. The final app group was added after the browser exposed the fast-key issue, then the app suite and syntax check were rerun.
- 1,000 deterministic generated layouts with reachability and validity checks.
- All 24 campaign rooms with earned upgrades, three Endless rooms, and replay verification.
- All 24 rooms with a starter robot, 40 additional Endless rooms, and 86,400 random-movement frames across 24 rooms.
- 144 campaign completions at production's 120 Hz timestep: 24 rooms with each of starter, width-only, bag-only, speed-only, suction-only, and fully upgraded builds. Routes do not deliberately seek keepsakes.
- Nine additional Endless seed inputs at 120 Hz, representing six unique normalized seeds. Numeric boundaries, text, zero, and emoji inputs are included.

The new optional build audit writes `tmp/physics-gap-audit-report.json` and was also run from another working directory. It shares the existing physical solver through an optional timestep parameter; the default solver still uses 60 Hz. State bounds, collision, movement speed, collection accounting, completion, and payout invariants passed. No new simulation or progression defect was reproduced.

## Browser and package checks

The extracted package loads v1.1.2. The finishing target is visible, and the How to play dialog preserves the active room and clock. A room timer stayed at 3.4083 seconds across help observations. Escape resumes cleaning.

At 390 × 844, the goal, full canvas, separate touch-control tray, and help dialog fit without horizontal overflow. The final goal font is 10 px. At the 960 × 800 embed size, the canvas ended at y=753 and the bottom hints at approximately y=796. Browser error/warning logs were empty. These are browser layout checks, not physical touchscreen, Safari, or Firefox tests.

A real Chrome playthrough of room 7 used ordinary mouse controls in the isolated earned six-room career. It collected the Arcade token, emptied the bag at the dock, and completed at the 95% threshold. The result showed **332 cleaning coins + 135 new bonuses = 467 earned**, moving the saved balance **395 → 862**. The breakdown and action buttons were readable without scrolling. Buying Bigger bag cost **550**, leaving **312** coins and raising its rank to 3. Reload retained the purchase and balance; newly unlocked room 8 opened with **180 capacity**. The displayed 0:45 Gold result is the simulation timer, not wall-clock playtime or a performance claim.

In the reloaded room 8, an immediate arrow-key tap stopped the old mouse target; two later screenshots showed the robot stationary instead of steering back. Fresh mouse input resumed following and collection. Escape paused correctly, and final browser error/warning logs were empty. The browser tools exercise click-and-release movement; raw hover without an initial click is covered by synthetic input tests. Physical touch/pen behavior remains unverified.

The current release manifest is recorded in [RELEASE.md](../RELEASE.md). Source, archive, and extracted content are checked by the packaging script. The user preview was safely refreshed from its menu into v1.1.2, retaining its existing 30 coins and completed first room. No player career was reset or edited for testing.
