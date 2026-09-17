# Sweep Shift validation

Validation date: **2026-09-17**. Version: **1.1.0**. Automated checks ran with Node.js **v24.19.0** on Windows. The automated audit, local browser integration, exact ZIP checks, and uploaded-game smoke check are complete.

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

## Current browser and interface checks

- Chrome completed room 7 (Closing Time) with ordinary mouse drags from a legitimately earned six-room QA career. The robot collected the Arcade token, emptied at a station, and triggered the finishing sweep at 95%. The result awarded **467 coins**, including **135** first-time bonuses, with Gold and a displayed **1:01** time. Saved balance changed **395 → 862**.
- The result opened Upgrades with three affordable choices. Bigger Bag cost **550**, changed level **2 → 3** and capacity **150 → 180**, and left **312** coins. Reload retained the purchase and balance. Newly unlocked room 8 (Fan Club) started with capacity **180**. This QA career used isolated session storage, not the owner's production save.
- In-app browser tests moved room 7 to **13%**, **39 pieces**, position **(540, 540)**. Browsing Upgrades and Rooms, choosing another room, cancelling, and resuming kept that same run, bag, position, and cleaning. The clock stopped during browsing and resumed afterward.
- Persistent Rooms/Upgrades/Treasures navigation was available from title, play, and result flows. All four location selectors and locked prerequisites were readable. Purchases displayed current/next stats, explicit levels, saved balance, and the missing coins needed.
- Mouse movement, the separate mobile movement pad (operated with a mouse), Escape pause/resume, and focus restoration worked. Input-controller tests separately exercise multiple synthetic touch identities; this is not a physical-phone test.
- Desktop, **390 × 844** phone layout, and **960 × 800** itch embed layout were inspected. At 390 × 844 the full canvas ended at about y=514 and the control tray at y=638, without horizontal overflow. At 960 × 800 the full canvas ended at y=753 and the hint row at y=796, without horizontal overflow.
- Two isolated real tabs on port 4183 synchronized sound and reduced-motion settings. Reload preserved both. A deliberately blocked-storage QA page displayed the expected warning and remained available to play.
- The checked local/packaged browser error and warning logs were empty. Ending, seed-zero replay, rejected rewards, resets, and delayed-save races have explicit application regression coverage; the previous release's ending/browser check is historical evidence only.

## Current package and hosted build

The current archive is **artifacts/sweep-shift-itch.zip**, with **11 files**, **47,133 bytes**, and SHA-256 **6255aaaa75b94e12694d0a326ccc37e5432c9a0d575ea27e784132d0b3e12297**. The root contains index.html and all eight JavaScript modules, CSS, and the SVG icon. All archive, extracted, source, and separately served HTTP hashes match.

The exact extracted archive was served on port 4182. Startup, real directional movement, automatic pickup, separate saved/pending balances, Upgrades browsing, Resume, and Escape pause passed. Its error/warning log was empty.

The new ZIP was uploaded to itch project **5021059**. Reloading the editor confirmed the new **46kb** file, its checked browser-playable flag, the rewritten description and short tagline, and **Draft** visibility. Five refreshed gameplay/menu screenshots uploaded and their first-five gallery positions survived a save/reload. Two older screenshots remain afterward; originals are retained in marketing/*.png. The public-publish action has not been taken.

The actual uploaded iframe at **https://html-classic.itch.zone/html/19281737/index.html?v=1789684379** loaded version 1.1 with the revised copy and navigation. The existing career's **365 saved coins** remained intact. Continue opened unlocked room 2 (Bench Business), automatic pickup produced **Bag 1 / 90** and **+1 this room**, and ordinary pointer/keyboard inputs were accepted. Focus loss and Escape paused the room. Upgrades displayed four affordable choices; browsing and Resume retained the same room and bag. No purchase was made in that existing career. The hosted tab's error/warning log was empty.

## Practical limits

All authored rooms and tested generated rooms are physically completable within the checked simulation. One thousand generated seeds and the bounded random-input run are broad coverage, not a proof of every seed or a real-time browser performance soak.

Saves remain local to a browser and hosting origin. Clearing site data removes them. Failed storage leaves only the current in-memory session. Browsing between in-game menus may preserve the active room, but leaving/reloading the page restarts unfinished cleaning; room coins become career coins only on completion. Web Locks support is used when available; no universal cross-browser atomicity guarantee is claimed.

No physical phone, Safari, Firefox, long-duration real-time browser soak, or external audience playtest has been recorded for this audit. Synthesized audio quality and overall feel remain subjects for the owner's playtest.
