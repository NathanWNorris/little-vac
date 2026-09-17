# Sweep Shift validation

Validation date: **2026-09-17**. Target version: **1.0.0**. Automated checks ran with Node.js **v24.19.0**. Browser checks used Chrome and the Codex in-app browser on Windows through the browser-control interface.

The sections below distinguish physical simulation, real browser interaction, packaged-file checks, and hosted-game checks. No physical-phone or additional browser-engine test is claimed.

## Automated content and physics

`node scripts/verify.mjs` runs the room, progression, and physical-playthrough suites. Node was called directly because npm was unavailable on the validation host. The solver moves the robot through the real simulation at 60 Hz; it does not teleport the robot, mark debris collected, inject purchase money, or force a room to complete.

| Check | Result |
| --- | --- |
| Authored campaign | All 24 rooms completed with real movement, suction, bag limits, and station unloading |
| Endless gameplay | Seeds 17, 2048, and 99001 completed physically |
| Room generation | 24 distinct campaign layouts and 100 reproducible endless seeds checked |
| Reachability | Connected floor, clear aisles, valid spawn, and reachable stations, debris, and trinkets |
| Movement | Cardinal/diagonal speed, wall collision, and invalid input handling checked |
| Suction | All material types, line of sight, bag capacity, and automatic unloading checked |
| Finishing sweep | Completion at 95%, remaining material value paid, bag emptied, no invented trinket |
| Currency integrity | Material value conserved; repeated settlement and reload cannot repeat run rewards |
| Restart | An unfinished restarted run cannot be settled for rewards |

The earned campaign route collected all 24 trinkets and received gold medals in all rooms. It earned **15,411 campaign coins**, spent **13,200** on all 20 upgrade ranks, and bought its final rank after room **22**. Three subsequent endless rooms and one campaign replay brought total test awards to **17,362**, leaving **4,162** coins.

The campaign solver took **936.98 simulated seconds**, with individual rooms ranging from **27.65 to 58.98 seconds**. These are efficient route-finding simulation times, not an estimate of human playtime or a completion-time claim for the store page.

An additional pass completed all 24 rooms using the **starter robot with zero upgrades**. This establishes that no specific upgrade build is required to finish. That pass took **1,787.38 simulated seconds**, with rooms ranging from **58.98 to 81.97 seconds**; those timings also are not human benchmarks.

Regenerable detailed evidence is written to `tmp/campaign-report.json`, `tmp/no-upgrade-report.json`, and the `tmp/earned-career*.json` fixtures. These test artifacts are excluded from the playable release.

## Progression and saves

`node scripts/verify-progression.mjs` passes **14 grouped checks** covering:

- Independent fresh careers and bounded upgrade effects.
- Purchases funded only by earned coins; no negative balances.
- Completion bonuses paid once, medal bonuses only for improvements, and trinkets awarded once.
- Missed trinkets collectable on a later replay without repeating other bonuses.
- Equivalent lifetime medal rewards whether gold is earned immediately or in stages.
- Rejection of invalid runs, locked-room results, and duplicate run IDs.
- Campaign unlocks, the final shell, and Endless Shift.
- Separate persistence of the earned finale and whether its ending has been viewed.
- Save/reload identity, settings, and duplicate-run history.
- Blocked reads, failed writes, malformed JSON, invalid versions, and damaged values.
- No future-room unlocks from a damaged saved unlock counter.
- Bounded currency and recent-run history.

The conservative economy check uses each room's actual debris value, **bronze medals**, and **no trinkets or replays**. It earns **13,851 coins** and funds all 20 ranks for **13,200**, with the final purchase in room **24**. The first room affords one upgrade, and the tested purchase route never waits more than one completed room between affordable upgrades.

## Real browser checks

The fresh-career browser run used ordinary keyboard and mouse controls through a full first room. The bag reached its 90-piece limit; suction stopped while movement remained available. Parking at the dock unloaded it. Reaching 95% triggered the final sweep and the completion screen.

That browser run earned **350 coins**, a bronze medal, and the room's trinket. Buying the first width upgrade cost **180**, leaving **170**. Reload retained the completed room, medal, trinket, and upgrade; Continue opened room 2. The recorded room time was **215.78 seconds**, including idle intervals while operating and inspecting the interface; it is not a human pacing benchmark.

Restarting room 2 cleared only that unfinished room. The 170-coin balance, first width upgrade, and completed room 1 remained intact.

Additional browser checks used separate QA careers earned by the physical solver, without forcing additional progress:

| Flow | Observed result |
| --- | --- |
| Complete campaign, ending not viewed | Continue opened the earned ending |
| Reload after viewing ending | Continue returned to room selection without replaying the ending or final room |
| Completed first district | Continue opened room 7, Closing Time |
| Collection shelf | All 24 named keepsakes were displayed |
| Final workshop | All five shells available; Sky equipped successfully |
| Maximum upgrades | All four cards showed rank 5 and disabled Fully upgraded buttons |
| Earlier workshop | 395 coins; next upgrades at 550 or 900 were correctly disabled; later shells remained locked |
| Settings | Mute and reduced motion persisted across reload |
| Reset cancellation | Confirmation appeared; Keep my career preserved the completed career |
| Endless seed form | `qa-clean-2026` repeatedly reopened canonical seed `4071079376` |
| Leave and reopen | Ordinary unfinished-room leave/reopen retained the same seed and preserved the 2,211-coin career balance |
| Pause | Escape opened the dialog, Escape closed it, and keyboard focus returned to the canvas |
| Browser logs | No error or warning entries during the late-career UI checks |

The browser run found an Escape-key issue: the browser's default action immediately closed a dialog opened by the same Escape event. The handler now prevents that default action and explicitly opens or closes the dialog. Opening and closing were rechecked after reloading the corrected source.

The responsive interface and the narrow-screen movement tray were inspected using a mobile-sized viewport and ordinary mouse input. This does **not** establish actual touchscreen or physical-phone compatibility.

## Packaged release and blocked storage

The exact archive `artifacts/sweep-shift-itch.zip` contains **8 files**, totals **37,697 bytes**, and has `index.html` at the root. Its SHA-256 is `665a749ef35ee0d70bbdf06de6768c86b87ab08e7425deecd42b4c63a5959100`.

Every ZIP entry, extracted file, and HTTP-served file matched its tested `dist` counterpart by hash. The extracted copy was served separately at `http://127.0.0.1:4182/`. Its browser smoke check opened the title and room 1, rendered the game, and accepted two seconds of real movement input: the robot reached y = 240 and collected 7 pieces (3.477% clean). Escape opened the correct pause dialog. Reload retained muted sound, reduced motion, and effects volume 0.65. No browser errors or warnings were recorded. This checks the distributed files in a browser; it is not a second complete browser campaign.

A separate browser check with storage blocked showed the explanation that progress could not be saved. The room remained playable and collected 7 pieces using normal movement. That check produced no browser errors or warnings. The automated storage tests separately cover failed reads, failed writes, and safe fallback careers.

The 1260 × 1000 cover and three actual gameplay screenshots have been uploaded to [the itch.io draft](https://fooded.itch.io/sweep-shift), project **5021059**. The uploaded ZIP is marked for browser play. Cream/teal styling, Sans Serif typography, and the sidebar have been saved. The saved Draft status was verified. Public publication is left to the owner.

The actual itch.io iframe also passed a browser smoke check. Run Game opened the title, and starting a shift opened room 1. Two ordinary mouse drags and a W-key movement collected **10 pieces**, showing **4% clean**. Interaction with the surrounding page caused the expected pause on loss of game focus; Resume continued the room. The observed hosted build was `https://html-classic.itch.zone/html/19281148/index.html?v=1789680692`. This is a hosted startup/input/pause check, not a claim of an additional full campaign playthrough online.

The playable archive, uploaded game, cover, screenshots, and saved draft styling have been reviewed. The matching 1260 × 320 banner was uploaded, and its saved appearance plus Draft status were verified after a page reload. The banner source is marketing/banner.html; its browser capture is marketing/banner.jpg. It does not modify the verified game archive.

## Practical limits

All 24 campaign rooms and the tested endless seeds are physically completable. The content generator was checked across 100 additional seeds; this is strong bounded coverage rather than an exhaustive proof of every possible seed.

Saves are local to a browser and hosting origin. Browser data clearing or blocked storage can remove persistence. A running room is restarted rather than resumed after leaving the page. All coins from an unfinished room are discarded, including material already emptied at a station; career coins are awarded on room completion. Audio is synthesized and begins after interaction; subjective audio quality and play feel remain matters for the owner's final review.

No physical phone, Safari, Firefox, long-duration performance soak, or external audience playtest has been recorded in this release pass.
