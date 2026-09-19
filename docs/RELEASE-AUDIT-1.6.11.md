# Little Vac 1.6.11 release audit

Audit date: September 19, 2026. Automated checks, targeted browser playtesting, package integrity, and hosted smoke passed. The saved browser-playable itch.io draft runs 1.6.11. Draft remains selected and Public unselected; no public-publish action was taken.

## Fixes

- `dist/app.js`: How to play and Credits focus their heading and reset dialog scroll on opening, so short viewports start at the first instructions. Other dialogs retain their existing focus behavior; Pause → How to play still returns to Pause.
- `dist/app.js`: a career reset received from another tab closes now-ineligible Endless or campaign-ending screens, including when no room has been loaded. Stale dialogs close and Rooms shows the updated career.
- `dist/app.js`: an open Settings dialog now reflects sound, volume, and reduced-motion changes from another tab without replacing its controls or losing focus.
- `scripts/verify-app.mjs`: three regression groups cover these changes. The cross-tab regressions failed before their fixes and passed afterward.
- `package.json` and `dist/index.html`: version set to 1.6.11. No physics, layout, renderer, progression, or save-format changes were needed.

## Automated checks — passed

| Coverage | This pass |
| --- | --- |
| Final logic suites | 48 app + 17 input + 16 progression + 10 career-store groups: **91 total**. |
| Syntax | 9 game modules and 10 development/test scripts. |
| New dialog coverage | Home help, Home credits, and Pause help/back-to-Pause; heading focus and initial scroll position. |
| New cross-tab coverage | Six reset paths: Endless and ending × storage event, storage event with Settings open, or a Settings save discovering the reset. Open Settings also retains focused controls while synchronizing values, and the next click applies the displayed state. |
| Fresh layout audit | 24 jobs, 50 areas, 50 unique authored layouts; 240 campaign seeds and 1,000 Endless seeds. All 1,000 generated layouts were unique across four locations and 101 debris counts. |
| Fresh earned campaign | All 24 jobs / 50 areas, 10,355 physical pickups, zero forced cleanup, all 24 treasures; three Endless completions and one replay. 21,437 coins awarded, 13,200 spent, 8,237 remaining; all four upgrade categories reached rank five. |
| Fresh deep run | All 24 jobs with starter stats, 40 additional Endless completions, and 86,400 random-movement frames across 24 rooms (1,440 simulated seconds). |

The deep command, `node scripts/verify.mjs --deep`, ran once during this pass before the app-only fixes. It checks physical suction, 100% gates, continuous hallway movement, backtracking, bag/value conservation, previous-area docking, resistant dust and stuck scraps, keepsakes, and rewards. The final logic suites and syntax check ran after the fixes. The older 144-run build matrix was **not rerun** and is not fresh evidence for this pass.

## Additional edge probes — passed

The local, ignored `tmp/edge-audit-1.6.10.mjs` probe and its JSON report retain the version name of the build inspected before the 1.6.11 bump. They add coverage beyond the existing suite:

- All **26 hallways**: exact radius-17 wall clearance at offsets 42.999, 43, and 43.001 pixels; **1,040 boundary crossings with immediate direction reversals**, full bags, and mixed 1/240, 1/120, 1/30, and 0.05-second timesteps. Position remained continuous, bag contents/value were conserved, and no unload occurred. These tests deliberately set up cleared-area fixtures; they do not claim 1,040 earned gate unlocks.
- **300 campaign rendering-command frames** across all 50 areas, multiple camera offsets, and both motion settings. Canvas calls stayed finite and save/restore stacks balanced; dock routes remained available from the hallway.
- **Nine marker cases**: nearly transparent final dust, still markers under reduced motion, the 80% threshold, offscreen counts, and suppression before Start/after completion or collection.
- **12 unusual seed inputs**: deterministic generation and replay through the normalized numeric seed, plus one rendering-command smoke frame per input. Four of these Endless rooms were physically completed at varied timesteps, totaling **1,471 real pickups**.

Rendering probes use a command-recording context, not browser rasterization. They validate marker and drawing logic, not visual appearance. Seed normalization can make different inputs share a layout. Automated route times are simulated, not human playtime. The earned campaign totaled 2,121.34 simulated seconds; starter plus 40 additional Endless completions totaled 7,179.11 simulated seconds.

Local evidence is in `tmp/campaign-report.json`, `tmp/deep-physics-report.json`, and `tmp/edge-audit-1.6.10.json`. The edge probe completed in approximately 2.8 seconds on the validation host; that is not a performance benchmark. Source review also covered fans, late-job resistance, and hallway/camera coordinate handling. No additional physics or renderer defect was reproduced.

## Browser checks — passed

- Manually played Room 13 with maximum upgrades in an isolated QA career. This session was still running 1.6.10 in memory; physics are unchanged in 1.6.11. The locked hallway blocked passage before 100%, the final two pieces had clear yellow markers, and all of Area 1 was physically cleaned. Entering Area 2 carried 195 pieces worth 374 coins, also confirmed by the live announcement. After collecting more dirt, the bag held 213 pieces worth 407 coins and the whole job had 414 pending coins. Walking back to Area 1 kept it at 100% and preserved the 407 bag-value / 414 pending totals. Saved career coins stayed at 6,286. This was a partial job, not a whole-job completion; reduced motion was on, so smooth camera animation is not a new manual result.
- After reloading 1.6.11, Home How to play and Credits at **640 × 360** focused `modalTitle` with dialog scroll position zero. Their titles were visible, and Help began at Step 1. Escape from Help returned focus to its invoking button.
- At **320 × 568**, Help showed its title and first step with scroll position zero; client and scroll widths were both 320px. These are desktop browser viewport checks, not physical-phone testing.
- At the normal desktop size, Room 13 started parked. D began play; Escape → How to play focused the heading at scroll position zero. Back to Pause retained 0% cleaning and focused Resume.
- The cross-tab reset and open-Settings fixes have automated regression coverage only; no live dual-tab reset was performed in this pass.

No new completed human campaign, physical touch-device, non-Chrome, audio-output, or native fullscreen-exit coverage is claimed.

## Packaging — passed

`artifacts/little-vac-itch.zip` contains **12 runtime files** with root `index.html`, is **66,351 bytes**, and has SHA-256 `06886e0b102965bc3bad9608d0be3a46b2cbc3c04167fd1861b41753affb9a05`. `scripts/package-release.ps1` verified source/archive/extracted-file hashes; an independent archive inspection also confirmed every file and the 1.6.11 package/footer version. No QA fixture is packaged.

The local handoff is `artifacts/publish-1.6.11`, containing the build, current description, retained cover/launch artwork and six gallery images, launch notes, and a manifest. The two menu images are explicitly labeled as older layouts because they predate the shared wallet position.

## Hosted build — passed, with save-history limit

The 1.6.11 ZIP was uploaded, saved, and reloaded with browser-playable checked, Draft selected, and Public unselected. The [actual hosted iframe](https://html-classic.itch.zone/html/19309856/index.html?v=1789855414) displayed 1.6.11. Help focused `modalTitle` with scroll position zero. Reduced motion changed from false to true, survived reload as true, and was restored to false. Play → D → Escape → Upgrades opened directly without a quit prompt; Resume preserved the run. No hosted purchase or completed job was performed. A final reload left the game tab on a fresh Home screen at Room 1/zero coins, marked as the deliverable.

The current iframe, the directly opened old 1.6.10 build, and the directly opened new 1.6.11 build each showed a fresh Room 1 career with zero coins. This pass therefore does **not** establish retention of the earlier five-coin career or explain its browser-storage history.

A separate read-only comparison with commit `76bbb82` found `progression.js`, `career-store.js`, storage initialization, and boot behavior unchanged. The key remains `sweep-shift-career-v1`, schema 1; the explicit reset-confirm action remains the sole reset call. A fixture written by actual 1.6.10 progression code with five coins, Room 1 completed, a bag upgrade, and muted sound loaded unchanged with status `ok` and zero writes. This supports source/package save compatibility, not a claim that an earlier browser save was present during the hosted check. Independent ZIP comparison also confirmed all 12 files match source and contain no QA bootstrap.

No game-source error was observed. The only reported log error was an unrelated `chrome-extension` `h1-vendors-main-popover` TypeError. Physical-phone/touch-hardware testing, non-Chrome engines, audio audition, and native fullscreen exit remain unverified. The retained gallery's two menu screenshots still predate the shared wallet arrangement.
