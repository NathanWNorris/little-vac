# Sweep Shift 1.5.2 local release candidate

The current **1.5.2** build is local. The reviewed **itch.io draft** still hosts **1.1.0** and was not changed during this update. Public publishing has not been performed.

## Verified build

- Archive: artifacts/sweep-shift-itch.zip
- Contents: **11 files**, index.html at root, no external runtime dependencies or QA fixtures.
- Size: **62,946 bytes**.
- SHA-256: **7bd60dea942e7c3b7b917c692850a0df74a08026ae647664d72f95e084d24ad8**.
- All source, archive, and extracted hashes match.
- This menu patch passed syntax and 39 app-orchestration groups, plus responsive browser checks. Campaign/deep physics evidence below belongs to 1.4.1. See [PLAYTEST.md](PLAYTEST.md) for evidence and the distinction between automated simulation and browser checks.

## What changed in 1.5.2

- Gameplay now matches the title and Pause screens with dark-green surroundings, a cream paper frame, red controls, and condensed headings.
- The HUD, area banners, start instructions, touch controls, and Room details use the matching palette with readable state colors.
- A compact header fits narrow screens. Desktop, short-window, and 320px browser checks passed, alongside all 39 app groups.
- Location artwork, simulation, save format, and gameplay rules are unchanged.

## Previous 1.5.1 changes

- Removed the lower home job/stat block. A short room caption sits directly beneath Continue; the existing title artwork remains.
- Upgrades during a job asks once, with Keep playing and Quit & upgrade. The prompt explains the loss of unfinished cleaning and coins. Keeping the job returns to play; confirming opens the shop directly.
- All dialogs use the home screen’s cream, dark ink, and red style, including Settings, help, and confirmation prompts.
- Desktop and 320px browser checks plus all 39 app groups passed. No simulation or save-format changes.

## Previous 1.5.0 changes

- Replaced the boxed home layout with an illustrated workshop title screen, large condensed cream/red lettering, and a short unboxed menu.
- New original Canvas artwork shows the game's vacuum leaving a clean trail through scattered debris. The image is static, drawn once per Home render, and has a dedicated phone composition.
- Pause now resembles a cream job slip with a red Resume action and simple text choices. The existing confirmation and paused-navigation behavior is retained.
- Current-job details, saved coins, progress, upgrade locks/availability, and endgame destinations remain visible and accurate.
- Desktop and 320px browser checks plus all 38 app groups passed. No simulation or save-format changes.

## Previous 1.4.4 changes

- Home shows a room-layout preview beside clear Play/Continue, Rooms, Upgrades, and How to play buttons. Icons, readable captions, and saved-coin/progress totals replace the sparse text-only layout.
- Upgrade availability is visible; an unfinished job explicitly shows the lock. Paused multi-area jobs show their current area and percentage.
- The primary label uses the same destination as its action, including finished-campaign and Endless states.
- Pause highlights Resume, groups Help/Settings and Main menu, and separates confirmed Restart/Quit actions. Main menu preserves the unfinished job.
- Help/Settings opened from Pause, including a cancelled reset confirmation, return to Pause instead of unexpectedly resuming. Back and Escape both keep the run frozen.

## Previous 1.4.3 changes

- Three numbered pictures replace long start/help instructions: Move, Clean, Empty. Original SVG diagrams show the robot, dirt, cursor/touch gesture, and green dock.
- Short captions, WASD keycaps, and a clear 100% goal explain the essentials. Extra tips are optional and collapsed.
- Guides use readable rows on narrow screens. The waiting layout grows naturally, avoiding clipped Start buttons and crowded columns in short desktop windows.
- Touch/pen users can scroll the guide without starting. The Start button activates the job; normal dragging works afterward. Mouse clicks and WASD still start normally.

## Previous 1.4.2 changes

- The last five uncollected pieces get larger yellow/white locator rings and small pointers, including barely visible dust.
- A pieces-left counter stays visible even when the bag-full guidance takes priority.
- Markers gently pulse normally and stay static with Reduced motion. Visual checks covered all four floor themes, one/two/five pieces, faint dust, and a 320px render.

## Previous 1.4.1 changes

- Dirt and its coin value remain in the bag when an area clears and when entering the next area. Partial and full bags both carry correctly.
- The drop-off dock works after clearing an area as well as during cleaning. Final job completion pays any remaining bag once.
- A mint/green route arrow leads to the drop-off at 80%+ capacity, with an EMPTY BAG marker when full. It takes priority over the exit arrow until the bag is emptied.
- The HUD now shows the coin value still in the bag and keeps the complete pending job total visible. Full-bag instructions appear immediately after a doorway transition.

## Previous 1.4.0 changes

- 24 campaign jobs now contain **50 different areas**. From room 9 onward, jobs expand from two connected areas to four.
- Clean **100%** to open the next-area door or finish. No leftover dirt is automatically collected; golden rings reveal even very faint remaining dust.
- Follow the amber arrow into the right-hand door and continue from the left side of the next area. Mouse, held keyboard, and touch controls stay active; there is no internal Start screen.
- Exactly **one dock per area**, including Endless. New jobs still begin parked until a left click or WASD.
- Later dust and stuck scraps resist suction more strongly. Suction upgrades clear them faster; every build remains capable of finishing.
- Area counters, door guidance, whole-job medal targets, and descriptions explain the new rules. Coins are saved and upgrades reopen only after the final area; quitting/restarting loses the whole unfinished job's pending coins.
- Closed doors render beneath dirt and do not cover it with a sign. The only treasure in a connected job is in its final area.

## What changed in 1.3.1

- Every new/restarted room places the vacuum in the first drop-off dock, instead of 80 pixels beside it.
- Fresh WASD and arrow-key presses start the room and immediately steer. Uppercase letters work; held-key repeats from a prior screen cannot accidentally start a room.
- Hovering, unrelated keys, and secondary clicks cannot start a waiting room. Its movement, suction, and clock stay frozen until activation.
- The ready screen and help now state both activation choices and the parked starting position.
- New rooms clear old reward notifications and announce the parked state.
- The old generation anchor is retained internally so debris, treasures, and seeded layouts do not reroll. Independent comparisons passed for 24 campaign rooms and 1,000 Endless seeds: only spawn coordinates changed.

## What changed in 1.3.0

- Workshop has wooden flooring, a pegboard/tool perimeter, sawdust, and detailed workbenches.
- After-Hours Arcade has dark patterned carpet, neon wall displays, closed/high-score signs, varied game screens, cocktail arcade tables, and brighter dust for contrast.
- Greenhouse has glass framing, planted beds, circular pots, seedling benches, a watering can, paved walkways, and roof-light patterns.
- Rooftop Party has a city backdrop, deck boards, parapet railings, string lights, and party-table settings.
- Room thumbnails reflect actual floor cutouts and themed props; location descriptions explain the setting. Locked previews remain visible.
- The start screen presents Mouse OR WASD as equal steering choices. A permanent play-screen reminder and clearer How to play text reinforce both controls.
- Static scenery is cached. Existing paths, collision boundaries, save progress, click-to-start rules, and upgrade rules are preserved.

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
