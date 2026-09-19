# Sweep Shift 1.6.2 draft release candidate

The **1.6.2** ZIP is uploaded to the existing [itch.io draft](https://fooded.itch.io/sweep-shift), project **5021059**. Reload confirmed the actual hosted version, shorter description, and simplified store setup. **The Draft badge remains visible; public publishing has not been performed.**

## Current change and validation — 2026-09-19

- The illustrated tutorial appears until Room 1 is completed. Later jobs and replays use a compact click/WASD start prompt; **How to play** still opens the full picture guide. The vacuum remains parked until an explicit start action.
- Targeted validation passed **42 app groups**, **17 input groups**, and syntax checking. The new regression reproduced the old repeated tutorial and verifies its replacement, idle/hover freeze, click/WASD activation, replay after reload, and manual Help. Desktop and **320px** visual checks passed.
- Simulation, authored rooms, balance, and save format are unchanged. Full campaign and deep physics results below are prior validation of that unchanged engine, not newly repeated playthroughs for 1.6.2.
- The saved store setup automatically loads the unchanged Home screen, has no oversized page banner, and shows the shorter **197-word** description with exactly six gallery links. The current theme persisted after reload. The hosted footer displays **v1.6.2**; autoloading Home does not start a room.
- The existing completed-Room-1 career opened Room 2 with the floor visible and the compact left-click/WASD prompt. It remained parked at **0% and 0 / 120 bag space**. Pressing **D** removed the prompt and started the job; **Pause → How to play** retained the full three-step illustrated guide. This is a targeted hosted startup/help check, not another completed-job or purchase playthrough.
- The publication boundary remains the final public-publish action. Keep the project in Draft for the user.

## Current upload assets

- Game: `artifacts/sweep-shift-itch.zip`, **64,762 bytes**, **12 runtime files** with `index.html` at the root. SHA-256: **90c65a6ab10bb7e2596de99ed80fd9b5188ad45e1e701b0a056f09ecef2c1219**.
- Handoff: `artifacts/publish-1.6.2`, containing that ZIP, the existing verified cover and gallery PNGs, a launch-image backup, current `description.html`, upload notes, and a file manifest.
- Cover: `marketing/cover.png` (**1260 × 1000**).
- Gallery: `marketing/01-rooms.png`, `marketing/02-arcade.png`, `marketing/03-greenhouse.png`, `marketing/04-rooftop.png`, `marketing/02-upgrades.png`, and `marketing/06-hallway.png`.
- Description: `marketing/description.html`. **No page banner is required**; the older banner is retained only in the historical 1.6.1 handoff.

## Historical 1.6.1 draft release candidate

The tested **1.6.1** build, current description, and refreshed artwork are uploaded to the [itch.io draft](https://fooded.itch.io/sweep-shift), project **5021059**. The actual hosted iframe displays **v1.6.1** and passed the hosted controls, pause, upgrade-confirmation, and existing-save smoke test. **Draft remains selected; public publishing has not been performed.**

## Historical 1.6.1 readiness — 2026-09-19

- The current standard suite passed all **24 jobs / 50 areas**, 3 Endless runs, and a replay. Supporting checks now total **84 groups**: 41 app, 17 input, 10 store, and 16 progression. New app regressions cover denied storage/Web Locks and stale-input cleanup on blur or hidden-page pause.
- A fresh browser career finished Room 1 at 100%, earned **350 coins** and the Tiny wrench, unlocked Room 2, and bought Wider sweep rank 1 for **180 coins**. The remaining **170 coins**, upgrade, and unlock survived reload. See [PLAYTEST.md](PLAYTEST.md) for scope and limitations.
- Simulation, room content, balance, and save format are unchanged. The prior deep and six-build matrix results below are historical validation of that same engine, not newly repeated runs.
- The unchanged extracted ZIP passed a local **960 × 800 sandboxed iframe** check: v1.6.1 startup, click/WASD activation, outside-click pause, one Upgrades confirmation, direct shop navigation after quitting, and no unfinished payout. Warning/error logs were empty. This models an embedded game locally; it does not verify the live itch.io build or a physical phone.
- A late-career fixture completed the first of Room 22's four areas, verified the locked gate and two-way hallway, and retained carried dirt, coins, and partial area-2 cleaning. This was not a complete four-area browser playthrough.
- Local [store description](marketing/description.html) and the current promotional/gallery PNGs below match the cream/red/dark-green theme and current rules. Older JPGs are historical and must not be included in the new upload.
- The browser-playable ZIP, current description and tagline, cover, banner, launch image, and six new gallery screenshots persisted on the itch.io draft. The user removed seven old screenshots after their deletion dialog stalled browser control.
- Store colors were saved: background **#17292d**, content **#f2e6c9**, text **#203b3b**, and links **#a63e27**. The actual [hosted iframe](https://html-classic.itch.zone/html/19303530/index.html?v=1789828455) loaded **v1.6.1**. Click/mouse and WASD activation, cleaning, Escape and outside-frame pause, one Upgrades confirmation, Keep playing, and direct quit-to-shop passed. Reload retained the existing Room 2 unlock, 5 saved coins, and purchased upgrade ranks; quitting did not award unfinished coins. Warning/error logs were empty during this smoke test, before the separate fullscreen check below.
- itch.io's external fullscreen control could not be verified in automated Chrome. Two activation attempts left fullscreen inactive and produced host-page `TypeError: not granted` and `NotSupportedError` for unavailable `screen.orientation.lock`. These errors came from `fooded.itch.io`, not the game iframe; embedded gameplay remained functional. The game and host fullscreen button were not changed.
- The hosted smoke test did not complete a job or make a purchase. Completed-job rewards and new-purchase persistence were verified locally as described above. The hosted game was left at Home without an unfinished test job. The remaining action is public publishing, deliberately left to the user. The old 1.1.0 draft inspection below is historical evidence.
- The [project editor](https://itch.io/game/edit/5021059#published) is positioned at visibility controls with **Draft selected, Public unselected, and Save visible**. The editor and hosted Home are retained for the user. A hosted preview screenshot is saved locally at `tmp/itch-1.6.1-hosted-preview.jpg`.

## Historical 1.6.1 upload assets

- Game: `artifacts/publish-1.6.1/sweep-shift-itch.zip`; **64,683 bytes**, SHA-256 **573520085d2c25f00144c4e8562cae6b14841809fac374071446d27da5f67d00**.
- Cover: `marketing/cover.png` (**1260 × 1000**).
- Banner: `marketing/banner.png` (**1260 × 320**).
- Launch image: `marketing/launch.png` (**960 × 800**).
- Actual-app gallery: `marketing/01-rooms.png`, `marketing/02-arcade.png`, `marketing/03-greenhouse.png`, `marketing/04-rooftop.png`, `marketing/02-upgrades.png`, and `marketing/06-hallway.png`.
- Description: `marketing/description.html`.

The `artifacts/publish-1.6.1` handoff contains the uploaded ZIP, current PNGs, `description.html`, and `UPLOAD-NOTES.md`. The current artwork and six screenshots persisted on the hosted draft; older JPG screenshots were excluded. The hosted version and gameplay smoke checks passed within the scope stated above.

## Historical 1.6.1 local build — 2026-09-18

- Archive: artifacts/publish-1.6.1/sweep-shift-itch.zip
- Contents: **12 files**, index.html at root, no external runtime dependencies or QA fixtures.
- Size: **64,683 bytes**.
- SHA-256: **573520085d2c25f00144c4e8562cae6b14841809fac374071446d27da5f67d00**.
- All source, archive, and extracted hashes match.
- Passed the standard 24-job/50-area earned campaign and 3 Endless runs, plus a fresh deep physics audit: a starter campaign, 40 Endless runs, 86,400 random movement frames, and 144 campaign clears across six upgrade builds at 120Hz. All 82 app/input/store/progression groups passed. A full two-area browser job verified cleaning, backtracking with a loaded bag, treasure, payout, reload persistence, and the next-room unlock. See [PLAYTEST.md](PLAYTEST.md) for exact scope and limitations.

## Previous 1.6.1 changes

- Clearer coin-saving instructions: earnings save when the whole job is finished.
- Consistent dock wording and leaner upgrade cards, with shortages and maximum levels still explicit.
- A matching 24/24 completion stamp replaces placeholder ending symbols; ending actions use short, direct labels.
- Desktop and 320px upgrade/ending checks passed. The audit found no reproducible gameplay defect, so the simulation, balance, and save format are unchanged.

## Previous 1.6.0 changes

- Real hallways join later areas in one world; the camera follows smoothly through them.
- A physical locked gate explains the 100% cleaning requirement. Unlocked passages stay open for travel in both directions.
- Previous rooms retain dirt, partial cleaning, and treasures. Shared bag/value and pending earnings survive every return trip, including visits to earlier docks.
- Mouse steering accounts for camera movement, Pause freezes it, and small yellow edge arrows locate offscreen final dirt.
- The standard campaign and supporting tests passed. Save format, job count, and upgrade rules are unchanged.

## Previous 1.5.4 changes

- The play screen has one compact row: clean percentage, bag space, and Pause. The full site header/navigation and large title/area banner are hidden while playing.
- Rooms, Upgrades, saved and pending coins, carried dirt value, and medal times are accessible from Pause.
- A small control reminder and room/area counter sit below the larger room view. Contextual guidance appears only when needed.
- All 39 app groups and targeted desktop, short-window, and 320px browser checks passed. No simulation or save-format changes.

## Previous 1.5.3 changes

- Applied the cream/red/dark-green theme across all screens, including Rooms, Upgrades, Treasures, rewards, ending, and Endless.
- Replaced separate frame styles with shared border, shadow, color, and typography tokens. Gameplay and popups now use identical paper frames.
- Updated selected/locked/disabled states, square buttons/cards, header icon, instructions, and notifications.
- Dock and next-area labels now use matching square paper signs; semantic guidance colors and distinct location artwork remain.
- All 39 app groups and targeted responsive browser checks passed. No simulation or save-format changes.

## Previous 1.5.2 changes

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

## Previously inspected 1.1.0 store page

- Title: **Sweep Shift**.
- Short description: **Clean 24 rooms, earn coins, and upgrade a tiny vacuum robot. A cozy browser game with endless shifts to unlock.**
- This historical copy was replaced by the current [store description](marketing/description.html) in the 1.6.1 draft upload.
- Type: HTML game; Simulation; free/no payments; comments enabled.
- Tags: cleaning, cozy, relaxing, singleplayer, top-down.
- Embed: **960 × 800**, mobile friendly, fullscreen control and scrollbars enabled; autostart disabled.
- Disclosure: AI-assisted Graphics, Text & Dialog, and Code; original procedurally synthesized audio described accurately.
- At that inspection, the hosted store used the prior cream/teal theme, robot cover, banner, and launch artwork. These were replaced by current theme colors and assets in the 1.6.1 draft upload.

Five prior 1.1.0 gameplay/menu screenshots are marketing/01-rooms.jpg through 05-upgrades.jpg. The upgrade screenshot was taken in the same audit before the final supporting-sentence edit, with legitimately earned affordable upgrades visible. Previous PNG screenshots are retained as source backups.

## Historical draft inspection — 1.1.0

The [existing itch.io draft](https://fooded.itch.io/sweep-shift), project **5021059**, received the **1.1.0** ZIP and five screenshots in the previous audit. At that time, reload confirmed the browser-playable upload, revised tagline/description, and Draft visibility. The five refreshed screenshots are first in the saved gallery; two earlier screenshots remain afterward. The uploaded iframe loaded version 1.1, retained the existing 365-coin career, started room 2, handled pickup/pause, and kept the room intact through the former Upgrades/Resume flow. Its error/warning log was empty. These are historical checks; **1.1.1, 1.1.2, 1.2.0, and 1.2.1 have not been uploaded**, and the final public-publish action has not been taken.

## Rebuild

Run **node scripts/check.mjs**, then **node scripts/verify.mjs**; use **--deep** for the extended physics audit and **node scripts/verify-builds.mjs** for the optional 120 Hz build matrix. Package with **./scripts/package-release.ps1** in PowerShell. Serve the extracted archive using **node scripts/serve.mjs --package** with a separate PORT. Record the new manifest and packaged browser results before uploading, then verify the actual hosted build after upload.
