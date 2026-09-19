# Little Vac validation

## Version 1.6.11 — follow-up release audit

Passed **48 app + 17 input + 16 progression + 10 career-store groups (91 total)** and syntax. A fresh deep run completed the earned campaign, all 24 starter jobs, 43 Endless runs, and 86,400 soak frames. Additional probes covered 26 hallways, 1,040 full-bag boundary crossings/reversals, 300 campaign rendering-command frames, nine marker cases, 12 unusual seeds, and four more physical Endless completions. Rendering-command probes are not browser screenshots; the 144-run matrix was not rerun. [Full audit](docs/RELEASE-AUDIT-1.6.11.md).

Manual Room 13 play cleaned its first area to 100% and verified locked-gate behavior, final-dirt markers, carried bag value, and backtracking without losing progress; this was a partial job with unchanged 1.6.10 physics still in memory. Reloaded 1.6.11 Help/Credits began at their headings on short/narrow viewports. The cross-tab fixes have automated coverage only.

The **66,351-byte**, 12-file package matched source/archive/extraction hashes, SHA-256 **06886e0b102965bc3bad9608d0be3a46b2cbc3c04167fd1861b41753affb9a05**. Saved hosted 1.6.11 passed Help focus/scroll, reduced-motion save/reload/restore, and play/pause/Upgrades/resume smoke checks. Room 1/zero coins appeared in the current iframe and both directly opened old/new builds, so no prior-career retention is claimed. A 1.6.10-written save fixture loaded unchanged; that is compatibility evidence only. No game-source error was observed; a Chrome-extension TypeError was unrelated. **Draft remains selected and Public unselected.**

## Historical version 1.6.10 — release audit

Version **1.6.10** passed the full earned 24-job/50-area campaign, 24 starter jobs, 144 campaign runs across six upgrade builds, additional Endless runs, and 88 app/input/progression/store groups. Fixed duplicate Resume controls, pre-start keyboard focus, stale accessible instructions, large wallet layout, and misleading treasure/suction copy. Manual browser checks covered a full first-room completion, purchases, reload persistence, startup, menus, settings, and Endless restart. See [the full audit](docs/RELEASE-AUDIT-1.6.10.md) for exact coverage and device limits.

The 12-file ZIP is **66,161 bytes**, SHA-256 **61884fae9f3b07d70f58d10bf217e3f8a3c19bd9e03281c3f86d51974d71fca5**; source/archive/extraction hashes match. The saved hosted build displays **v1.6.10** and retains the existing player save. Browser-playable is checked; **Draft remains selected and Public unselected**. Physical phones and native fullscreen exit remain unverified; an itch.io orientation-lock warning is recorded in the audit.

## Version 1.6.9 — consistent menu balances

Version **1.6.9** uses a shared coin display across menus. Rooms, Upgrades, and Treasures have identical wallet coordinates at desktop and 320px widths; Home, Endless, completion, and campaign-ending screens also display it at the top right. Navigation no longer duplicates the balance. The room completion count moves into the Rooms subtitle, and paused notices follow the shared heading. Purchases refresh visible balances without changing the current screen or focus. Syntax and all **45 app checks** passed, including delayed purchases while browsing Rooms or Treasures. Narrow layouts have no horizontal overflow. The ZIP has **12 runtime files**, root `index.html`, **65,916 bytes**, and SHA-256 **5f073d1a460b2b07e0fd5f73a4c2d6e63b336396603bbd1f436a81616c956d96**; source/archive/extraction hashes match. The hosted **v1.6.9** build displays the existing **5 coins** on Home, Rooms, Upgrades, and Treasures. All three tabbed pages have identical wallet coordinates. Room 2 progress remains intact and browser warning/error logs are empty. Browser-playable is saved, **Draft** remains selected, and Public remains unselected.

## Version 1.6.8 — balance beside the heading

Version **1.6.8** removes Play room from Upgrades and moves the single coin balance beside its heading. Active jobs keep one Resume room action in navigation. Syntax and all **45 app checks** passed; desktop and 320px views were checked (305px client/scroll width, no horizontal overflow). The verified ZIP contains **12 runtime files**, is **65,802 bytes**, and has SHA-256 **00877bba2f4d48a63016ab5e0c04bb1a6e3a78185f70539c43706589969ec513**. Source/archive/extraction hashes match. The saved hosted build displays **v1.6.8**, with one **5-coin** balance beside Upgrades and no Play room button. Existing upgrades remain intact and browser warning/error logs are empty. The existing project remains **Draft**, with Public unselected.

## Version 1.6.7 — simpler Upgrades

Upgrades now uses four icon/benefit/price rows, optional stats and color sections, one wallet, and one Resume action for a paused job. Pending earnings remain separate. Syntax and **45 app groups** passed. Local browser checks at **960 × 800** and **320px** passed; the narrow view's client/scroll widths were **305 / 305**, with no horizontal overflow, including a separately expanded stats table. After equipping Mint, the color section stayed open and focus remained on that shell. These are targeted interface checks, not a new campaign or physical-phone playthrough.

The package is **65,844 bytes**, has **12 runtime files** and root `index.html`, and has SHA-256 **2f74d3afea138c01390c7f2cffc585224cc335b2257540954524d49a14110133**. Source/archive/extraction hashes match. The complete `artifacts/publish-1.6.7` handoff includes the refreshed **1080 × 880** Upgrades screenshot.

The saved/reloaded browser-playable upload's [actual iframe](https://html-classic.itch.zone/html/19305257/index.html?v=1789836003) displayed **v1.6.7**. Hosted Upgrades visibly showed four rows, collapsed stats/colors, and one navigation wallet with **5 coins**. The existing career retained Room 2, width/bag ranks 1, and speed/pull ranks 0; warning/error logs were empty. Gallery image `30101140` replaced `30099715` after the user cleared the native confirmation; the draft retained exactly six images and its Draft badge. No hosted purchase was performed. **Draft remained selected and Public unselected; no public-publish action was taken.**

## Historical version 1.6.6 — one balance on Upgrades

Version **1.6.6** removes the duplicate balance beside the Upgrades heading. The top navigation keeps the single coin icon and number. Purchasing and pending earnings are unchanged. Syntax checks and all **45 app checks** passed; local and hosted Upgrades screens were visually checked. The hosted v1.6.6 screen exposes exactly one balance, retains the existing 5 coins and Room 2 progress, and has no browser warnings/errors. **The itch.io project remains Draft; Public is unselected.**

## Historical 1.6.5 record

Current draft candidate: **1.6.5**, simplifying the coin display. Local checks, packaging, and the hosted display check passed. Earlier versions, filenames, hashes, URLs, and results below are historical evidence and are not validation of this package.

## Version 1.6.5 — simpler coin display

Saved balances use a shared SVG coin and number, with accessible amount-and-coins labels; pending-earnings wording is unchanged. The mobile header wraps. Syntax and **45 app groups** passed. Local Chrome checked the desktop QA-six-room shop at **395 coins** and a **320px** layout with client/scroll width **305 / 305**, confirming no horizontal overflow. These are targeted presentation checks, not a new campaign or physical-phone playthrough.

The package is **64,886 bytes**, has **12 runtime files** and root `index.html`, and has SHA-256 **050b9c80275faaa56ca5d69e0655012ddaf4d6e3b9d8aeba23746d3dcbd3c22b**. Source/archive/extraction hashes match. `artifacts/publish-1.6.5` contains the exact ZIP and retained artwork, gallery, and description.

The saved/reloaded browser-playable upload's [actual iframe](https://html-classic.itch.zone/html/19305008/index.html?v=1789834791) displays **v1.6.5**. Hosted desktop Upgrades visibly shows a coin icon and **5** in navigation and the shop, without the former saved-coins label; its accessible image label is **5 coins**. The existing Room 2 career, 5 coins, and width/bag ranks 1 remained unchanged. Warning/error logs were empty. The same single game tab was left at Upgrades. **Draft remained selected and Public unselected; no public-publish action was taken.**

## Version 1.6.4 — upgrades without leaving the job

Open Upgrades from Pause or the menus, spend saved career coins, and resume the same job with the new stats. Cleaning, bag contents, and job progress survive the purchase and menu transitions. Pending job coins cannot be spent and are paid only after the whole job is complete. Quitting remains optional and still discards unfinished cleaning and coins.

Automated validation passed **45 app**, **16 progression**, **17 input**, and **10 career-store** groups; syntax passed for **9 runtime modules and 10 scripts**. Coverage includes saved-coin purchases, updated stats and full-bag resume, pending-only funds being insufficient, asynchronous guards, and one-time job settlement.

Local Chrome used an isolated six-room QA career. Ordinary mouse cleaning in Room 7 reached **8%**, **25 / 150** bag space, **29 pending coins**, and **395 saved coins**. **Pause → Main menu → Upgrades** opened directly without a quit dialog and kept the pending balance distinct. Equipping Coral preserved the run, and Resume retained **8%** cleaning and **25** bag pieces. No warnings/errors appeared. This browser check exercised menu navigation and shell selection; actual saved-coin purchases and stat changes were verified in the automated app tests.

The verified ZIP contains **12 runtime files** with root `index.html`, is **64,754 bytes**, and has SHA-256 **0b181e7d4f7a2e7279069ddef47965b47d792f9c076549a068cc1cd0499c08d6**. Source/archive/extracted hashes match. The handoff is `artifacts/publish-1.6.4`. No new campaign or physical-device playthrough is claimed. Older quit-before-upgrading restrictions are historical and are superseded by this change.

The browser-playable ZIP replaced the previous `little-vac-itch.zip` upload; its playable setting and revised description persisted after saving/reloading. The [actual hosted iframe](https://html-classic.itch.zone/html/19304630/index.html?v=1789833338) displayed **v1.6.4**. The existing career retained **Room 2**, **5 coins**, width/bag ranks **1 / 5**, and speed/pull ranks **0**. **Continue → D → Escape → Main menu → Upgrades** opened directly without a quit prompt. The shop kept Room 2 paused and displayed **0 pending coins** separately from **5 saved coins**; Resume returned to that same room at **0%** with **0 / 120** bag space. Reload returned to Home with Room 2 available. No browser warnings/errors appeared. No hosted purchase or job completion was performed; those transactions are covered by the automated tests. The hosted shop screenshot is `tmp/little-vac-1.6.4-hosted-shop.jpg`. **Draft remained visible and Public unselected; no public-publish action was taken.**

## 2026-09-19 — version 1.6.3 branding update

The visible game name, marketing templates, current project links, and current documentation use **Little Vac**. The cream/red/dark-green theme and robot artwork are retained. The GitHub repository has been renamed to [NathanWNorris/little-vac](https://github.com/NathanWNorris/little-vac), and the existing itch.io project title and slug are saved as [Little Vac](https://fooded.itch.io/little-vac). Reload confirmed the title and slug, and the browser-playable 1.6.3 upload passed the hosted smoke check below.

The legacy `sweep-shift-career-v1` save key is intentionally unchanged. This branding change does not claim a new physics, balance, campaign, or device-validation result. Targeted checks passed **42 app groups**, **17 input groups**, and syntax checking. The new package contains **12 runtime files**, with **index.html at the ZIP root**, is **64,759 bytes**, and has SHA-256 **d8e1db30193e66843f193aaeafbfcdfac69de94a1c9455bde4c6d452e2807d39**. Source, archive, and extracted-file hashes match. This is package integrity validation, not an actual hosted playthrough.

The cover (**1260 × 1000**), launch image (**960 × 800**), optional banner (**1260 × 320**), Rooms screenshot, and Upgrades screenshot were recaptured with the Little Vac branding. Four gameplay gallery images were retained because they contain no old wordmark. PNG formats and dimensions were checked. Five obsolete marketing JPG screenshots were moved, with matching hashes, into the ignored local backup `artifacts/legacy-branding-1.6.2`; Git history also preserves them.

The handoff is `artifacts/publish-1.6.3`, with the exact ZIP, cover, launch image, six gallery PNGs, current description, upload notes, and a SHA-256 manifest. `little-vac-itch.zip` is browser-playable; the former `sweep-shift-itch.zip` remains hidden and nonplayable as a rollback archive.

The [actual hosted iframe](https://html-classic.itch.zone/html/19304224/index.html?v=1789832427) displayed **LITTLE VAC**, **v1.6.3**, and the new name in Credits. The saved store gallery contains exactly six images: `30098624`, `30098629`, `30098626`, `30098625`, `30099714`, and `30099715`; old-wordmark images `30098627` and `30098628` were removed. The new launch image was saved as the embed background, with its Little Vac thumbnail visually confirmed after reload. No page banner is configured.

The existing career retained **Room 2**, **5 saved coins**, **Wider sweep 1 / 5**, **Bigger bag 1 / 5**, and no speed/pull upgrades. Room 2 opened parked at **0%**, with **0 / 120** bag space and the compact start prompt. **D** removed the prompt and started the room; **Escape** opened Pause; manual **How to play** showed all three illustrated steps and **Back to Pause**. Reload returned to Home with Room 2 available. No game warnings/errors appeared; two itch.io dashboard `game:set_state` warnings occurred while saving the editor.

This was a targeted hosted branding, startup, help, and existing-save check, without another completed job or purchase. No new campaign, fullscreen, or physical-phone result is claimed. The temporary viewport was reset. One Chrome tab remained at the project editor's visibility controls, showing **Draft selected, Public unselected, and Save visible**. The hosted Home screenshot is `tmp/little-vac-hosted-home.jpg`. **No public-publish action was taken.**

## 2026-09-19 — version 1.6.2 tutorial follow-up

Completing Room 1 now replaces the repeated illustrated tutorial with a compact click/WASD start prompt on later jobs and replays. The full guide remains available through **How to play**. Every new job still spawns parked at its dock; movement, suction, and the clock wait for a deliberate click, WASD/arrow key, or touch Start action. Physics, room content, balance, and save format are unchanged.

Targeted validation passed **42 app-orchestration groups**, **17 input groups**, and the syntax check. The new app regression failed against the old repeated-guide behavior, then passed after the change. It covers the full guide before the first success, compact Room 2 startup, frozen state during hover and idle frames, left-click activation, compact replay after reload, manual full Help, and WASD activation and steering. Existing tests retain touch, pause, restart, quit, hallway, and save checks. These use the real application with controlled DOM and career fixtures; they are not a new physical campaign playthrough.

Desktop and **320px** visual checks passed for the compact prompt and full manual guide. These are responsive browser checks, not a physical-phone test. The full campaign and deeper engine checks were not repeated for this tutorial-only patch; their prior scope remains documented below.

The new ZIP contains **12 runtime files**, is **64,762 bytes**, and has SHA-256 **90c65a6ab10bb7e2596de99ed80fd9b5188ad45e1e701b0a056f09ecef2c1219**. It has been uploaded to the existing [itch.io draft](https://fooded.itch.io/sweep-shift).

Reload of the actual hosted page confirmed **v1.6.2**, no oversized page banner, automatic loading of the unchanged Home screen, the shorter **197-word** description, exactly **six gallery links**, and the saved theme. The **Draft** badge remained visible. Continue from the existing completed-Room-1 career opened Room 2 with the floor visible and a compact left-click/WASD prompt, parked at **0% with 0 / 120 bag space**. Pressing **D** removed the prompt and began the job. **Pause → How to play** still showed the full three-step illustrated guide. This targeted hosted check did not complete a job or make a purchase, and no new fullscreen result is claimed. No public-publish action was performed.

## 2026-09-19 — final publication pass, version 1.6.1

The current standard suite passed the earned **24-job / 50-area campaign**, **3 Endless runs**, and a replay. The supporting suites now contain **84 passing groups**: 41 app, 17 input, 10 career-store, and 16 progression groups. Two new app regressions cover startup with denied storage/Web Locks and safe pause/input cleanup after window blur or document visibility changes. The simulation, authored rooms, balance, and save format remain unchanged. The earlier deep physics and six-build results below still apply to that unchanged engine; those large matrices were not rerun during this publication pass.

A fresh, isolated browser career completed **Room 1 at 100%** through ordinary play. The job took **3:23 of game time**, earned **255 cleaning coins + 95 bonus coins = 350 coins**, received Bronze, found the **Tiny wrench**, and unlocked **Room 2**. Buying the first **Wider sweep** rank cost **180 coins**, left **170 coins**, and increased the rank to **1**. Reloading preserved the earned unlock, purchase, and balance, verified in the actual interface. This is a complete opening-job browser playthrough, not a manual replay of the campaign; it did not modify the user's career.

The economy review also confirmed that bronze completion without treasures or replays earns **17,926 coins** and funds all **20 upgrade ranks** for **13,200 coins** by Room 21. No upgrade, medal target, or treasure is required to finish the campaign. Ending-seen state and Endless access persist independently, and completion/replay checks prevent duplicate achievement payouts. Automated route times do not measure human difficulty or enjoyment.

A separate completed-career `?career=24` fixture tested Room 22, which has four areas. Its first area was cleaned to **100%** through normal play. The gate blocked passage before completion and allowed travel in both directions afterward. Backtracking retained **18 bag pieces worth 39 coins**, **2% cleaning in area 2**, and **269 pending job coins**. This check completed one area and exercised its hallway; it did **not** complete the whole four-area job. Room 7's arcade and Room 13's greenhouse also received partial play and screenshot checks.

The unmodified extracted release ZIP passed a local **960 × 800 iframe** check served through `tmp/serve-release-check.mjs`, with a `localhost` frame inside a `127.0.0.1` parent and sandbox permissions `allow-scripts allow-same-origin allow-pointer-lock`. It loaded **v1.6.1**, accepted click/WASD activation, paused when clicking outside the game, showed one Upgrades confirmation, and went directly to the shop after confirmed quitting without awarding unfinished coins. Warning/error logs were empty for this iframe session and the fresh-career browser session. This is a local model of an embedded game, not a live itch.io verification or physical-phone test. The ZIP remains **64,683 bytes**, SHA-256 **573520085d2c25f00144c4e8562cae6b14841809fac374071446d27da5f67d00**.

Local marketing HTML now matches the current cream/red/dark-green theme and describes **24 jobs, 50 areas, 100% cleaning, and walkable hallways**. Verified promotional PNGs are `marketing/cover.png` (**1260 × 1000**), `marketing/banner.png` (**1260 × 320**), and `marketing/launch.png` (**960 × 800**). The current gallery comes from the actual app: `marketing/01-rooms.png`, `marketing/02-arcade.png`, `marketing/03-greenhouse.png`, `marketing/04-rooftop.png`, `marketing/02-upgrades.png`, and `marketing/06-hallway.png`. Older JPGs are historical and must be excluded from the new upload.

The `artifacts/publish-1.6.1` handoff was uploaded to the existing [itch.io draft](https://fooded.itch.io/sweep-shift), project **5021059**. The current tagline and description, cover, banner, launch image, and six gallery screenshots persisted. The user removed seven obsolete screenshots after a deletion dialog stalled browser control. Store colors saved as background **#17292d**, content **#f2e6c9**, text **#203b3b**, and links **#a63e27**.

The actual [hosted game iframe](https://html-classic.itch.zone/html/19303530/index.html?v=1789828455) loaded in Chrome and displayed footer **v1.6.1**. Continue opened Room 2 parked at **0% with an empty bag**. Clicking Start and steering with the mouse reached **5%**, carrying **16 / 120 pieces worth 22 coins**. Escape paused. Upgrades showed one **Leave this job?** prompt; **Keep playing** restored the same 5% and 16 pieces. Reopening Upgrades and confirming Quit opened the shop directly without a second prompt, discarded unfinished earnings, and left the existing **5 saved coins** unchanged.

Reload retained **Room 2**, **5 saved coins**, and the existing upgrade ranks: **Wider sweep 1, Bigger bag 1, Quicker wheels 0, Stronger suction 0**. A new Room 2 started from its parked state with the **D** key; clicking outside the iframe paused it. The empty test job was quit and the hosted game returned to Home. Browser warning/error logs were empty both before and after reload, before the separate fullscreen attempts below. This hosted smoke test did **not** complete a job or buy an upgrade; completed-job rewards and new-purchase persistence remain the local evidence described above. No production game source changed. **Draft remains selected and the final public-publish action has not been taken.**

A later check attempted itch.io's external **Enter fullscreen** control twice, once by its semantic control and once by coordinate click. `document.fullscreenElement` remained false. The host page at `fooded.itch.io` logged `TypeError: not granted` and a `NotSupportedError` because `screen.orientation.lock` was unavailable on this device. The errors did not originate in the game iframe and embedded gameplay was unaffected. **Fullscreen could not be verified under automated Chrome**; the earlier empty-log result applies only to the game/start/pause/reload smoke check, not the entire session. No game or host-button change was made.

The final editor view at `https://itch.io/game/edit/5021059#published` visibly showed **Draft selected, Public unselected, and Save**. The editor and hosted Home were retained for the user, and the hosted preview screenshot was saved at `tmp/itch-1.6.1-hosted-preview.jpg`. No public-publish action was performed.

## 2026-09-18 — version 1.6.1 deep playthrough and interface cleanup

The audit found no confirmed simulation bug. This patch clarifies that coins save only when the whole job is finished, uses consistent dock terminology, removes repeated upgrade purchase/status labels, and replaces unrelated ending glyphs with a paper **24 / 24** completion stamp and shorter buttons. The simulation and save format are unchanged.

Automated checks completed the standard **24 campaign jobs / 50 areas and 3 Endless runs**. Deep checks also completed all 24 jobs at starter stats, 40 additional Endless rooms, and 86,400 random-movement frames. The six-build matrix at the production 120 Hz timestep completed **144 campaign clears and 9 Endless runs**. An independent hallway geometry audit checked **139,178 hallway positions and 4,199,296 robot-body probes**. All **82 control, storage, progression, and app groups** passed: 39 app, 17 input, 10 store, and 16 progression groups. These automated checks are not human playtime or a physical-device playthrough.

The live browser playthrough used the ordinary isolated `?career=12` QA career and completed both areas of Room 13 at **100%**, using normal WebMCP steering, suction, collision, and unloading. It did not artificially complete an area or alter the active run. Backtracking preserved a carried bag of **23 pieces worth 45 coins**. The final three dirt markers were visible and helped locate the remaining pieces. Completion took **3:11 of game time**, earned **753 cleaning coins + 115 bonus coins = 868 coins**, moved the saved balance from **510 to 1,378**, found the **Seed locket**, and unlocked **Room 14**. The initial QA career is a fixture, separate from real player saves; the subsequent job was played through normally. This is one complete two-area browser job, not a manual replay of all 24 jobs.

Reloading retained Room 14 and the earned balance. A normal Wider sweep purchase cost **1,350 coins**, changed its rank from **4 to 5**, and left **28 coins**. The maximum-rank button was disabled, and unavailable upgrades correctly showed shortages of **872** and **1,322** coins. Updated upgrade cards passed desktop and 320px visual checks. A separate completed-career `?career=24` fixture verified the actual ending screen and new completion stamp at desktop and 320px with no horizontal page overflow; **Play endless** opened Endless successfully. Warning/error logs were empty for both browser sessions. Responsive browser sizing was reset afterward; these layout checks are not physical-phone tests.

## Version 1.6.0 — walkable hallways and backtracking

Areas now occupy one horizontal world connected by 120px-high hallways. Locked gates block movement until the preceding area is completely clean; opened gates stay open in both directions. Switching the active simulation area preserves world position rather than relocating the vacuum. Each area retains its debris, partial dust progress, treasure, and cleaned state. Bag/value, pending coins, job time, and the camera survive return trips and paused navigation. The camera follows horizontal movement smoothly, freezes with Pause, and keeps mouse coordinates aligned while crossing a seam. Reduced motion uses direct tracking. Offscreen final dirt has small yellow edge pointers.

Syntax and the full standard suite passed: **24 campaign jobs / 50 areas and 3 Endless runs**, 39 app groups, 17 input groups, 16 progression groups, 9 store groups, and generation checks over 240 campaign seeds / 1,000 Endless seeds. The earned campaign used 2,121.34 simulated seconds; these are automated route times, not human playtime. Additional four-area checks passed at starter stats / 120Hz and maximum stats / 50ms steps. Focused regressions cover blocked gates, continuous movement both ways, preserved partial dust and treasure, full and partial bags, returning to an earlier dock with no duplicate payment, stationary mouse targets during camera movement, and held keyboard/touch input across the seam.

Browser checks used clearly marked, temporary fixtures with artificial starting positions and room completion. All movement and suction afterward used the real app: the locked gate blocked crossing; the open hallway was crossed forward, backward, and forward again; the second area's progress and carried dirt survived. Screenshots showed both areas and the connecting floor during travel, the lock/open signs, a yellow edge pointer for three offscreen pieces, and a 320px layout without horizontal page overflow. A fresh ordinary QA run also started at the dock, cleaned through normal movement, and approached the locked gate. Warning/error logs were empty. These targeted browser checks are not a manual campaign replay or physical-phone test. The ordinary QA preview and real saves remain separate from these disposable fixtures.

## Version 1.5.4 — compact play screen

Gameplay has one top row containing cleaning percentage, bag capacity, and Pause. The site header, navigation, large room heading, area banner, and coin counters no longer compete with the room. A small footer retains Mouse/WASD and room/area position. Dock, exit, heavy-dirt, and last-piece hints appear only when relevant. Pause has Rooms and Upgrades shortcuts and a collapsed details section for saved/pending coins, bag value, area name, and whole-job medal targets.

Syntax and all **39 app-orchestration groups** passed. Existing checks now exercise the Pause navigation paths and verify area-footer changes, carried bag values, and saved/pending totals in Pause after a doorway transition. The real browser loaded, started, moved, and cleaned an isolated Room 13 fixture. Pause details, Rooms → Resume, and Upgrades → one confirmation → Keep playing worked without losing the job. Browser warning/error logs were empty.

Visual checks at normal desktop, 1000×600, and 320×740 confirmed the single-row HUD and no horizontal overflow. The complete room fits the short desktop viewport, and Pause retains a 44px target at 320px. The start guide remains available before movement. These are targeted interface and navigation checks, not a repeated campaign simulation or physical-phone playtest. No real career was modified; simulation and save format are unchanged.

## Version 1.5.3 — one theme throughout

Shared theme tokens replace per-screen colors and frame metrics. All non-title screens and dialogs use the same 9px red top edge, cream surface, square corners, and 8×9px ink shadow. Rooms, upgrades, treasures, rewards, ending, and Endless now inherit the paper palette. Locked/disabled states, selected location tabs, icons, diagrams, notifications, and Canvas dock/door labels no longer retain the old gray/yellow interface styling. Location art, semantic green dock/gold exit guidance, simulation, and saves remain unchanged.

Syntax and all **39 app-orchestration groups** passed. Browser checks covered desktop and 320px Rooms, Upgrades, Treasures, and Endless, including selected/locked rooms, unavailable purchases, and found/missing treasures. Computed-style comparison confirmed gameplay and Pause have identical backgrounds, border widths/colors, corner radii, and shadows. Narrow layouts had no horizontal overflow.

A disposable gallery using actual app markup and styles visually verified rewards/bonus notes, campaign ending, affordable/maxed upgrades, and the real Canvas dock/exit labels. Gallery states were artificial and accessed no real saves. Actual ending-to-Endless navigation was also checked on the isolated completed-career fixture. Warning/error logs were empty. These targeted checks are not a campaign replay or physical-phone test.

## Version 1.5.2 — gameplay theme

Gameplay now uses dark-green surroundings and a cream paper frame, red controls, condensed headings, and matching HUD/start-guide colors. Distinct district Canvas artwork, cleaning mechanics, and saved progress are unchanged. Green dock and ochre exit/last-dirt guidance retain their meanings with dark text on light surfaces.

Syntax and all **39 app-orchestration groups** passed. Browser checks on the isolated earned-12 fixture covered starting and cleaning, the Pause popup, Room details, and the start instructions. Normal desktop, 320×740, and 1000×600 layouts showed no horizontal overflow; short windows retain ordinary vertical scrolling. The phone header stays on one line, and the three-picture guide remains readable. Warning/error logs were empty. This is a visual patch with targeted browser checks, not a repeated campaign simulation or physical-phone test.

## Version 1.5.1 — simpler home and single upgrade confirmation

Home keeps the workshop illustration and short menu, replacing the lower job/stat block with one room caption beneath Continue. Dialogs now use cream paper, dark ink, red accents, and condensed headings. The picture guide keeps its dark illustrated panels for contrast.

Syntax and all **39 app-orchestration groups** passed. The new regression covers opening Upgrades from a live room, Rooms, and Home: Keep playing restores the same run, Escape retains it, time stays frozen behind the prompt, and Quit & upgrade opens the shop directly without another confirmation or unfinished payout. Saved career data remains unchanged.

Browser checks on the isolated earned-12 fixture verified the single confirmation, Keep playing, and direct exit to Upgrades, plus Settings and the three-picture help. Desktop and 320×740 checks found no horizontal overflow in the home/help/confirmation layouts. Browser warning/error logs were empty. No real player run or save was reset. Gameplay physics and save format are unchanged; these targeted checks are not a full campaign replay or physical-phone test.

## Version 1.5.0 — workshop title screen

The boxed home layout is replaced by a full illustrated floor, oversized cream/red title lettering, a simple menu list, and a compact current-job note. The original Canvas title art reuses the gameplay vacuum and draws a clean trail through a dirty workshop floor. It is static and drawn once when Home renders, with no animation loop or external assets. Pause uses a cream paper-slip treatment and the existing safe navigation actions.

Syntax and all **38 app-orchestration groups** passed. Browser review covered the desktop and 320×740 title composition, readable mobile menu targets without horizontal overflow, the paper Pause screen, and returning to Home. Browser warning/error logs were empty. The gameplay renderer, simulation, progression, and save format were unchanged; no campaign physics replay was repeated for this art/layout patch. The fresh preview uses the isolated earned-12 fixture, separate from the player's running job.

## Version 1.4.4 — home and pause menus

Home pairs an actual room-layout preview with a prominent Play/Continue/Resume button, labeled menu icons, and explicit upgrade availability or an unfinished-job lock. Its primary label and action share the same destination, including completed-career and Endless states. Multi-area paused jobs show the current area number and percentage. Pause separates Resume and safe navigation from confirmed restart/quit actions; Main menu retains the unfinished run. Help, Settings, and cancelled reset prompts reached through Pause return to Pause.

Syntax and **38 app-orchestration groups** passed. New navigation regressions cover nested Back/Escape paths, home/resume retention of bag/value/time/progress, and fresh/completed/Endless primary destinations. Browser checks on the isolated earned-12 fixture verified the desktop and 320×740 home/pause layouts with no horizontal overflow, Settings → Back to pause, Main menu with a locked upgrade button, and a live paused-state reading. Warning/error logs were empty. No real user save was changed. These are targeted menu checks, not a full campaign replay or physical-phone test.

## Version 1.4.3 — three-picture instructions

The start screen and How to play now share three numbered SVG illustrations, brief captions, visible WASD keys, and a single 100% goal. Optional tips stay collapsed. The layout uses readable rows on narrow screens and a wider waiting screen on short desktop windows. Waiting instructions allow native vertical scrolling; touch/pen gestures cannot accidentally start the job. Tapping Start then dragging retains normal steering.

Syntax and all **36 app-orchestration groups** passed, including the revised touch/pen scrolling, explicit Start, and subsequent steering regression. Browser checks covered the home help dialog, in-room help, and start screen at normal desktop, 1000×600, and 320×740 sizes. Guide cards had no horizontal overflow; Start was not clipped in an inner scrolling panel. Starting restored the normal canvas layout and touch steering surface. Warning/error logs were empty. These are responsive desktop-browser checks, not physical-phone testing; campaign physics were unchanged and not rerun.

## Version 1.4.2 — last-piece visibility

Syntax and the existing 36 app-orchestration checks passed for this visual/UI patch. An isolated browser gallery using the real renderer verified one, two, and five remaining pieces, including dust with 0.001 amount, on all four floor themes. The stronger markers depend on actual remaining-piece count, remain readable at 320px, support static reduced-motion rendering, and coexist with full-bag drop-off guidance. Browser error/warning logs were empty. Static visual fixtures are not playthroughs; no campaign simulation was repeated for this rendering-only change.

## Version 1.4.1 — carried dirt and drop-off guidance

Intermediate completion no longer deposits or clears the bag. Dirt count and weighted coin value survive doorway entry, with the full-bag flag already correct in the first frame. Cleared areas permit normal dock unloading. Final job completion still pays the remaining bag exactly once.

Regression checks physically carry full and partial bags through a doorway, block new pickups while full, unload at the old or new dock, reset partial unloading progress at entry, and reconcile all material value. App checks cover bag-value labels, pending totals, pause/browse/resume, cancelled quit, restart, and confirmed quit. The HUD distinguishes value in the bag from the total pending job earnings; area-clear no longer plays an unloading sound.

Syntax, the standard 24-job/50-area earned route, and all **36 app groups** passed. Deep physics completed 24 starter jobs, 40 additional Endless rooms, and 86,400 random-motion frames without a carried-bag softlock or currency mismatch. The earned route used 2,079 simulated seconds; times are automated, not human playtime. The six-build matrix below belongs to 1.4.0 and was not repeated for this patch.

Mint drop-off guidance is shown from 80% capacity, taking priority over the amber exit route. Route verification covered 23,668 reachable-cell routes and 3,968 priority states. An isolated static browser gallery visually confirmed full-bag guidance with closed/open exits and its switch back to amber when empty, plus the drop-off marker at 320px render width. The live 1.4.1 preview showed the new in-bag coin label and an empty warning/error log. These browser checks are not a full manual campaign replay.

## Version 1.4.0 — connected areas and full cleaning

The local campaign now contains 50 distinct areas across 24 jobs. Rooms 1–8 have one area, 9–17 have two, 18–21 have three, and 22–24 have four. Every area has one dock. The initial job starts parked; internal doorways keep the same canvas, steering gesture, job time, and provisional coins. A right-hand exit leads to a left-hand entrance at matching height.

All pieces must be physically collected before an area clears. Focused regressions verify that 95% and 99.9995% remain incomplete. Dust and stuck debris resistance rises from 1 to 2.6 across the campaign; upgrades reduce collection time without making any build mandatory. Faint residual dust retains its golden locator ring.

Verification on 2026-09-18:

- Syntax; 16 progression, 17 input, 10 store, and 34 app-orchestration groups passed.
- 50 unique campaign layouts, 240 alternate campaign seeds, and 1,000 Endless layouts passed connectivity, entrance alignment, one-dock, material reachability, and deterministic generation checks.
- All 24 jobs / 50 areas completed using ordinary simulated movement and earned upgrades. Every pickup was physical, with zero automatic cleanup. Total simulated campaign time: 2,036.35 seconds; this is not human playtime.
- Deep checks completed the entire campaign with starter stats, 40 additional Endless rooms, and 86,400 random-movement frames.
- The 120 Hz matrix completed 144 campaign runs across starter, width-only, bag-only, speed-only, suction-only, and maximum builds, plus nine Endless seed inputs.
- UI lifecycle tests verify doorway input continuity (keyboard and held touch), no intermediate reward or upgrade access, whole-job restart/quit behavior, and fresh click/WASD activation only at the start of a job.
- An isolated browser preview confirmed the 100% instructions, late-job counter, initial dock gate, and no console warnings/errors. Original two-area browser play checked an opened exit and progression into the next area before the final seamless-entry revision. The final revision's transition behavior is covered by the real simulation and app tests above, not claimed as a full manual replay.
- A static browser gallery visually checked final left entrances, right exits, arrows around furniture, and greenhouse/rooftop artwork. Static fixtures are visual checks, not completed playthroughs.

Bronze completion without treasures or replays earns 17,926 coins and can buy all 20 upgrade ranks by room 21. The earlier career format is unchanged. Existing progress and purchases remain valid. The local release ZIP is verified in RELEASE.md; no public upload occurred.

## Previous 1.1.1 candidate

Run **node scripts/check.mjs**, then **node scripts/verify.mjs** to reproduce the current checks. Syntax validation, **14 progression**, **14 input**, **9 career-store**, and **15 app-orchestration** groups passed, along with **1,000** generated layouts, all **24** campaign rooms using earned upgrades, three standard Endless rooms, and a replay. The deeper starter-campaign/random-movement audit below belongs to 1.1.0 and was not rerun for this control/menu change.

- Upgrades and shell changes are unavailable while a room is active, even when paused or browsing menus. Opening Upgrades explains the requirement and offers Resume or an explicit quit path. Confirmed quitting opens Upgrades and discards only the unfinished room; completing a room also enables purchases. Tests cover cancelled quits, paused/title/finishing states, pending settlement, and a queued purchase or shell change racing room startup.
- Mouse pointer movement supplies a target without a held button. Release preserves the mouse target, leaving the room clears it, and pause/input cleanup prevents stale movement. Touch/pen ownership, touch dragging, keyboard priority, and coordinate scaling remain covered. No-button pointer movement is verified with synthetic events; the browser tool cannot generate raw hover.
- In the isolated port-4181 six-room QA career, room 7's Upgrades action showed the lock dialog. After a mouse click and release, the robot continued from approximately **(212.999, 539.91)** to **(492.652, 539.14)** without a held button.
- Pause → Quit → Cancel retained **13%** cleaned, **39** bag pieces, and the same position. Confirming Quit cleared the run, opened Upgrades, kept **395 saved coins** and the existing upgrades, and discarded **45 pending coins**. Browser error/warning logs were empty.
- The exact extracted ZIP served on port 4182 displayed **v1.1.1**, started room 1, blocked the shop with the upgrade-lock dialog, and returned to play after cancellation. At **390 × 844**, the canvas, control tray, and navigation fit; the Rooms paused banner and quit button wrapped cleanly. Document width was **375 px** within the **390 px** viewport. Error/warning logs were empty. This was a layout check, not a physical touchscreen test.

The historical 1.1.1 ZIP contained **11 files**, was **47,475 bytes**, and had SHA-256 **01ccf41c073ad211034029b185927e7eff07cd6aa2782774728eee5401497a64**. Its package manifest verified root index.html and matching source, archive, and extracted content. Exact-package browser and phone-layout checks passed as described above. No 1.1.1 upload or hosted-page verification is claimed. The latest archive is described in RELEASE.md.

## Historical 1.1.0 audit

The remaining sections document the completed 1.1.0 audit, including its then-current archive and hosted build. Midroom Upgrades browsing described there has been replaced by the 1.1.1 restriction above. Historical evidence is retained rather than presented as a new run.

## Reproduce this audit

```sh
node scripts/check.mjs
node scripts/verify.mjs --deep
```

The syntax check discovers every JavaScript module under `dist` and `scripts` (eight game modules and nine development/test scripts at this audit). The default verification command runs room generation, progression, input, career-store, app orchestration, physics regressions, and the full earned campaign. `--deep` adds the starter campaign, 40 additional endless rooms, and random-movement simulation. npm is not required.

The solver uses ordinary directional movement through the real 60 Hz simulation. It does not teleport the robot, mark debris collected, inject purchase money, or force room completion. Input and storage unit checks use controlled event/storage fixtures; they are not physical-device or browser-concurrency tests.

## Reproduced fixes

| Issue | Evidence and correction |
| --- | --- |
| Suction through a furniture corner | Room 1, robot at (244, 165), debris 9 at approximately (306.815, 224.868): the old 12 px samples missed the workbench corner. Exact segment/cell intersection blocks the same ray and prevents the pull force. The reverse ray is also blocked; a clear aisle still works. |
| Full bag blocked optional keepsakes | The old run could not collect a keepsake after filling its bag. Keepsake collection now runs separately from dirt suction; walking over one works with a full bag and emits one collectible event. |
| Dust cleanup undercount | A fading dust patch could be removed while its cleaned contribution remained 0.999999. The final fractional remainder is now included. Every simulated frame checks progress against remaining dust and collected pieces. |
| Unrelated pointer releases interrupted movement | The input controller keeps one controlling pointer and ignores other fingers, secondary mouse buttons, and unrelated release events. Pause releases capture and ignores stale motion. |
| Stale tabs could overwrite later career progress | Career transactions begin from the latest persisted state. Optional Web Locks serialize purchases and run settlement across tabs; storage-fixture tests preserve completed rooms, coins, settings, and duplicate-run protection. |
| Failed writes could lose session state or revive an older save | A failed storage read/write switches the current store to memory for the rest of that session. Later operations retain the in-memory career and issue a bounded warning instead of reloading the older disk copy. |
| Endless seed zero changed on replay/restart | The app treated normalized numeric zero as a missing seed. Nullish fallback retains zero, and the app regression suite compares the entire room before and after restart and replay. |
| An external reset could produce a false completion screen | A later active room could lose access after another tab reset the career. The app now clears invalidated runs and checks rejected settlement before showing a success screen. Both delivered and missing storage-event cases are tested. |
| Restart/switch/reset could resume the old room while saving | With a deliberately delayed save lock, the old restart path advanced the room clock from 10 to 10.10 seconds. Transition guards now freeze the old simulation until the new room or career is ready; restart, room switch, and reset are covered separately. |
| A delayed purchase navigated back to Upgrades unexpectedly | Finishing a purchase after navigating to Rooms used to force the Upgrades screen open again. The app now refreshes the purchase view only when it is still being shown. |

The three physics cases were run against the previous release implementation and the corrected implementation. The corner visibility changed from true to false, the full-bag keepsake from uncollected to collected, and dust progress from 0.9999989999999997 to normal floating-point one (0.9999999999999999).

## Automated content and physical play

| Check | Result |
| --- | --- |
| Authored campaign | All 24 distinct rooms completed using earned upgrades, real movement, suction, bag limits, and station unloading |
| Starter campaign | All 24 rooms completed again with zero upgrades |
| Endless gameplay | Standard seeds 17, 2048, and 99001, plus deep seeds 0 through 39; deep seeds alternate starter and maximum builds |
| Room generation | All 1,000 seeds from 0 through 999 produced distinct, deterministic layouts; all four locations and all 101 debris population sizes appeared |
| Reachability | Connected floor, intact 80 px aisle modules, valid spawn clearance, and reachable stations, debris, and keepsakes |
| Random movement | 86,400 frames across all 24 rooms, representing 1,440 simulated seconds |
| Per-frame invariants | Robot and uncollected debris stay on valid floor; movement speed, finite state, bag capacity, dust progress, material value, and collected state remain valid |
| Particles | Random-movement checks kept the particle population at or below 110 |
| Completion | One final sweep at 95%; remaining material and bag value paid once; no invented keepsake; later steps do not change the result |
| Restart and reload | Unfinished runs cannot settle; repeated settlement and reload cannot duplicate rewards |

The earned campaign collected all 24 keepsakes and received gold medals. It earned **15,411 campaign coins**, spent **13,200** on all 20 upgrade ranks, and bought its final rank after room **22**. The standard three endless rooms and one campaign replay brought total test awards to **17,362**, leaving **4,162** coins.

The earned campaign took **939.11 simulated seconds**, with rooms from **27.68 to 58.98 seconds**. The zero-upgrade campaign took **1,780.52 simulated seconds**. Its 24 rooms plus the 40 deep endless rooms totaled **3,859.50 simulated seconds**. These are automated route-finding times, not human playtime estimates or performance benchmarks.

Regenerable evidence is written to `tmp/campaign-report.json`, `tmp/deep-physics-report.json`, and `tmp/earned-career*.json`. Test fixtures are excluded from the playable release.

## Progression, input, and saves

The integrated suite passes **14 progression checks**, **10 input checks**, **9 career-store checks**, and **11 app-orchestration checks**, in addition to generation and physical simulation.

Progression checks cover independent defaults, bounded stats, earned purchases, unique completion/medal/keepsake bonuses, gold-first versus staged medal rewards, invalid and locked-room settlement, unlock order, ending state, replay rewards, save validation, corrupt/blocked storage, bounded balances, and duplicate history. The conservative bronze/no-keepsake economy earns **13,851 coins**, funds all 20 ranks for **13,200**, and completes purchases in room **24**, without replays. The first room affords an upgrade; the tested purchase route waits at most one completed room between purchases.

Input checks cover scaled and letterboxed mouse coordinates, secondary buttons, multiple pointer identities, relative joystick origins, capped diagonal movement, the separate control tray, pause/capture cleanup, mouse dead zones, keyboard priority, invalid coordinates, detached capture, and detached state snapshots. They establish controller behavior with synthetic events; physical touchscreen behavior remains unverified.

Career-store checks cover stale tab settings after a completed room, serialized competing purchases, duplicate settlement through two stores, failed-write memory retention, blocked reads, rejected mutations, unavailable-lock fallback, ordered same-store work, synchronous fallback transactions, external reset synchronization, and failing view callbacks. Cross-tab fixtures use a queued lock-manager double. Two real browser tabs also synchronized sound and reduced-motion settings; reload retained both changes. Without Web Locks, a synchronous fallback is used; these tests do not prove atomic purchases across all browsers or separate processes.

App-orchestration checks load the real application code against a lightweight DOM double, with its real input, save, room, progression, and simulation modules. They cover preserving paused cleaning while browsing, next-room upgrade effects, seed-zero restart/replay, single settlement, Continue, settings and purchase synchronization, reset/reward rejection, room-change confirmation, delayed restart/switch/reset, and navigation during a delayed purchase. These tests use explicit career and completion fixtures to exercise screen transitions; they do not replace physical campaign completion, rendered-interface checks, or browser interaction tests.

## Historical 1.1.0 browser and interface checks

- Chrome completed room 7 (Closing Time) with ordinary mouse drags from a legitimately earned six-room QA career. The robot collected the Arcade token, emptied at a station, and triggered the finishing sweep at 95%. The result awarded **467 coins**, including **135** first-time bonuses, with Gold and a displayed **1:01** time. Saved balance changed **395 → 862**.
- The result opened Upgrades with three affordable choices. Bigger Bag cost **550**, changed level **2 → 3** and capacity **150 → 180**, and left **312** coins. Reload retained the purchase and balance. Newly unlocked room 8 (Fan Club) started with capacity **180**. This QA career used isolated session storage, not the owner's production save.
- In-app browser tests moved room 7 to **13%**, **39 pieces**, position **(540, 540)**. Browsing Upgrades and Rooms, choosing another room, cancelling, and resuming kept that same run, bag, position, and cleaning. The clock stopped during browsing and resumed afterward.
- Persistent Rooms/Upgrades/Treasures navigation was available from title, play, and result flows. All four location selectors and locked prerequisites were readable. Purchases displayed current/next stats, explicit levels, saved balance, and the missing coins needed.
- Mouse movement, the separate mobile movement pad (operated with a mouse), Escape pause/resume, and focus restoration worked. Input-controller tests separately exercise multiple synthetic touch identities; this is not a physical-phone test.
- Desktop, **390 × 844** phone layout, and **960 × 800** itch embed layout were inspected. At 390 × 844 the full canvas ended at about y=514 and the control tray at y=638, without horizontal overflow. At 960 × 800 the full canvas ended at y=753 and the hint row at y=796, without horizontal overflow.
- Two isolated real tabs on port 4183 synchronized sound and reduced-motion settings. Reload preserved both. A deliberately blocked-storage QA page displayed the expected warning and remained available to play.
- The checked local/packaged browser error and warning logs were empty. Ending, seed-zero replay, rejected rewards, resets, and delayed-save races have explicit application regression coverage; the previous release's ending/browser check is historical evidence only.

## Historical 1.1.0 package and hosted build

The 1.1.0 archive had **11 files**, **47,133 bytes**, and SHA-256 **6255aaaa75b94e12694d0a326ccc37e5432c9a0d575ea27e784132d0b3e12297**. Its root contained index.html and all eight JavaScript modules, CSS, and the SVG icon. Its archive, extracted, source, and separately served HTTP hashes matched. The local ZIP has since been replaced by the 1.1.1 candidate above; itch.io still hosts 1.1.0.

The exact extracted archive was served on port 4182. Startup, real directional movement, automatic pickup, separate saved/pending balances, Upgrades browsing, Resume, and Escape pause passed. Its error/warning log was empty.

The new ZIP was uploaded to itch project **5021059**. Reloading the editor confirmed the new **46kb** file, its checked browser-playable flag, the rewritten description and short tagline, and **Draft** visibility. Five refreshed gameplay/menu screenshots uploaded and their first-five gallery positions survived a save/reload. Two older screenshots remain afterward; originals are retained in marketing/*.png. The public-publish action has not been taken.

The actual uploaded iframe at **https://html-classic.itch.zone/html/19281737/index.html?v=1789684379** loaded version 1.1 with the revised copy and navigation. The existing career's **365 saved coins** remained intact. Continue opened unlocked room 2 (Bench Business), automatic pickup produced **Bag 1 / 90** and **+1 this room**, and ordinary pointer/keyboard inputs were accepted. Focus loss and Escape paused the room. Upgrades displayed four affordable choices; browsing and Resume retained the same room and bag. No purchase was made in that existing career. The hosted tab's error/warning log was empty.

## Practical limits

All authored rooms and tested generated rooms are physically completable within the checked simulation. One thousand generated seeds and the bounded random-input run are broad coverage, not a proof of every seed or a real-time browser performance soak.

Saves remain local to a browser and hosting origin. Clearing site data removes them. Failed storage leaves only the current in-memory session. Browsing between in-game menus may preserve the active room, but leaving/reloading the page restarts unfinished cleaning; room coins become career coins only on completion. Web Locks support is used when available; no universal cross-browser atomicity guarantee is claimed.

No physical phone, Safari, Firefox, long-duration real-time browser soak, or external audience playtest has been recorded for this audit. Synthesized audio quality and overall feel remain subjects for the owner's playtest.
