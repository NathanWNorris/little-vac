# Little Vac 1.6.10 release audit

Audit date: September 19, 2026. Automated checks, targeted browser playtesting, package integrity, and the hosted smoke check passed. The itch.io draft now runs 1.6.10. No public-publish action was taken.

## Changes

- `dist/ui.js`: removed the duplicate Resume button from the paused-room banner. Menu wallets abbreviate balances of at least 10,000 with floored tenths of a thousand (K), or million (M) from 1,000,000 upward; the exact balance remains in the accessible label and tooltip. Other coin displays stay exact.
- `dist/app.js`: the covered canvas stays out of the tab order until Start. Its accessible instructions change from parked/start directions to active steering directions and remain correct after menu resume. The Treasures hint now says one treasure per job, in its final area.
- `scripts/verify-app.mjs`: expanded existing startup, restart, menu-resume, and focused keyboard-start assertions for canvas focus and accessible instructions.
- `marketing/description.html`: clarified that stronger suction clears stubborn dirt faster, without implying an upgrade is required.
- `package.json` and `dist/index.html`: version set to 1.6.10. No simulation, room-layout, progression, or save-format changes were needed.

## Automated checks — passed

Commands used: `node scripts/verify.mjs --deep`, `node scripts/verify-builds.mjs`, `node scripts/check.mjs`, and the individual app/input/progression/career-store suites.

| Coverage | Result |
| --- | --- |
| App, input, progression, career store | 45 + 17 + 16 + 10 groups passed; 88 total. The 45 app groups were rerun after the focus/instruction fix. |
| Syntax | 9 game modules and 10 development/test scripts passed. |
| Layout audit | 24 jobs, 50 areas, 50 unique authored layouts; 240 campaign seeds and 1,000 Endless seeds checked. All 1,000 generated layouts were unique across four locations and 101 debris counts. |
| Earned campaign | 24 jobs / 50 areas completed with ordinary movement and suction: 10,355 physical pickups, zero forced cleanup, all 24 treasures. Also completed three Endless rooms and one replay. |
| Earned progression | 21,437 coins awarded; 13,200 spent; 8,237 remaining. All four upgrade categories reached rank five through earned purchases. |
| Deep run | All 24 jobs completed with starter stats; 40 additional Endless rooms completed; 86,400 random-movement frames across 24 rooms, representing 1,440 simulated seconds. |
| Production timestep matrix | 144 campaign runs at 120 Hz: 24 each with starter, width-only, bag-only, speed-only, pull-only, and maximum upgrades. 62,130 physical pickups; nine additional Endless seed inputs. |
| Wallet boundaries | 9,999 remains exact; 10,000 displays 10K; 10,199 displays 10.1K; 99,999 displays 99.9K; 999,999 displays 999.9K; 1,000,000 displays 1M; 1,999,999 displays 1.9M; the legal maximum 99,999,999 displays 99.9M. Exact accessible labels/tooltips, exact class-token matching, and non-menu amounts verified with read-only assertions. |

The physics checks assert real 100% cleanup, locked gates, continuous hallway movement, backtracking, conserved bag contents and material value, unloading in previous areas, resistant dust/stuck scraps, full-bag treasure collection, replay rewards, and seeded Endless behavior. Source review also covered fans and resistance. No physics defect was reproduced and no physics fix was made.

The deep suite took approximately 51.09 seconds and the build matrix 122.31 seconds on the validation host while running concurrently. These are test-process elapsed times, not performance benchmarks. Earned-campaign time was 2,121.34 simulated seconds; starter plus additional Endless completions totaled 7,179.11 simulated seconds. These route-finding times are not human playtime. Nine seed inputs are not a claim of nine unique layouts, because inputs may normalize to the same seed.

Local generated evidence: `tmp/campaign-report.json`, `tmp/deep-physics-report.json`, and `tmp/physics-gap-audit-report.json`. These ignored reports are not required game assets. The deep physics and build matrix ran before the small UI/copy changes above; those changes do not alter the simulation. Automated app tests use a browser harness, not a real rendering engine.

## Browser checks

- Manually completed First Sweep through visible mouse steering and ordinary suction: 100% cleanup, two full-bag dock returns, Tiny wrench, Silver medal, 370 coins (255 cleaning + 115 bonuses). This play began on 1.6.9; the unchanged physics were also covered by the automated matrix. No forced pickups or completion were used.
- Mid-room pause → Upgrades preserved 42% cleaning and pending earnings while the wallet stayed at zero. After finishing, bought Bigger bag for 180, reloaded into 1.6.10, and retained Room 2, the treasure, 190 coins, and 120 capacity. A second purchase while Room 2 was paused left 10 saved coins and preserved the room.
- On 1.6.10, the compact Room 2 prompt and full new-career picture guide retained Start focus. Shift+Tab went to the visible Pause button instead of the covered canvas. WASD and Enter started deliberately, changed the accessible instructions, and Escape paused. Paused menus contained only one Resume action.
- Isolated earned-career fixtures exercised the campaign ending, all 24 treasures, maxed upgrades, equipping Sky, reduced motion, and cancelling career reset without losing progress. Seed 0 opened Endless with the purchased 240-capacity bag; a confirmed restart returned to 0%, waited for Start, and retained seed 0 and the saved wallet. The greenhouse startup showed its own art, one dock, and a locked hallway. Full hallway crossing/backtracking coverage in this audit is automated, not a claim of manually completing every connected job.
- A storage-denied session showed a clear saving warning and remained playable. Real player storage was not reset or replaced by test fixtures.
- Desktop Chrome and a 320px viewport were inspected. Home had no horizontal overflow; Upgrades and Treasures both had 305px client/scroll widths and the same wallet rectangle (x172.25, y216, width102.75, height36 with a 6,286 balance). These are responsive desktop checks, not a physical-phone test.
- Local game warning/error logs were empty. Audio hardware/output quality, physical touch devices, and non-Chrome engines were not directly tested.

## Packaging and hosted upload

`artifacts/little-vac-itch.zip` contains 12 runtime files with root `index.html`, is 66,161 bytes, and has SHA-256 `61884fae9f3b07d70f58d10bf217e3f8a3c19bd9e03281c3f86d51974d71fca5`. Source, archive, and extracted file hashes match. No QA fixture or injection is packaged.

The saved/reloaded itch.io editor has the new ZIP selected as browser-playable, Draft selected, and Public unselected. The actual hosted iframe at `https://html-classic.itch.zone/html/19307988/index.html?v=1789847324` displayed v1.6.10 and preserved the real career: Room 2, 5 coins, width/bag rank1, speed/pull rank0. Hosted Room 2 waited at0%, started with D, paused with Escape, and opened Upgrades directly with one Resume action. No hosted purchase or reset was performed. The corrected suction sentence persisted after saving and reloading the editor.

The host's fullscreen control expanded the game to the1920×889 viewport. The host logged `screen.orientation.lock() is not available on this device`; Escape did not exit the expanded view through the automation tool. Navigation restored the normal view. Native fullscreen exit is therefore not claimed as verified. The error originated on the itch.io parent page, not in game code.

The existing six-image gallery remains; its two menu images predate the shared coin-header placement. Updating those screenshots is optional presentation work, not a gameplay blocker. Current source and package are ready for an initial desktop browser release, with the device/fullscreen limits above recorded explicitly.
